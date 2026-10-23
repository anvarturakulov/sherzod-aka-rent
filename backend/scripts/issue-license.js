/**
 * Выписывает license.lic на один Windows-компьютер.
 * Секретный ключ: backend/license-keys/private.pem (в поставку клиенту не входит).
 *
 *   node scripts/issue-license.js --show-guid
 *   node scripts/issue-license.js --guid <MachineGuid> --client "Имя" [--expires 2027-12-31] [--out license.lic]
 */
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { execFileSync } = require("child_process");

const privateKeyPath = path.join(__dirname, "..", "license-keys", "private.pem");

function canonicalLicensePayload(payload) {
  return JSON.stringify({
    machineGuid: String(payload.machineGuid || "").trim().toLowerCase(),
    clientName: String(payload.clientName || "").trim(),
    expiresAt: payload.expiresAt ? String(payload.expiresAt) : null,
  });
}

function readWindowsMachineGuid() {
  const out = execFileSync(
    "reg",
    ["query", "HKLM\\SOFTWARE\\Microsoft\\Cryptography", "/v", "MachineGuid"],
    { encoding: "utf8" },
  );
  const match = out.match(/MachineGuid\s+REG_SZ\s+(\S+)/i);
  if (!match) {
    throw new Error("Не удалось прочитать MachineGuid.");
  }
  return match[1].trim();
}

function parseArgs(argv) {
  const out = {};
  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--show-guid") out.showGuid = true;
    else if (arg === "--guid") out.guid = argv[++i];
    else if (arg === "--client") out.client = argv[++i];
    else if (arg === "--expires") out.expires = argv[++i];
    else if (arg === "--out") out.out = argv[++i];
    else {
      console.error("Неизвестный аргумент:", arg);
      process.exit(1);
    }
  }
  return out;
}

function main() {
  const args = parseArgs(process.argv);
  if (args.showGuid || (!args.guid && !args.client)) {
    console.log(readWindowsMachineGuid());
    if (args.showGuid || !args.client) return;
  }
  if (!args.guid || !args.client) {
    console.error(
      'Нужны --guid и --client. Пример: node scripts/issue-license.js --guid <MachineGuid> --client "Имя"',
    );
    process.exit(1);
  }
  if (args.expires && !/^\d{4}-\d{2}-\d{2}$/.test(args.expires)) {
    console.error("Дата --expires должна быть в виде ГГГГ-ММ-ДД.");
    process.exit(1);
  }
  if (!fs.existsSync(privateKeyPath)) {
    console.error("Нет секретного ключа:", privateKeyPath);
    process.exit(1);
  }

  const payload = {
    machineGuid: args.guid.trim().toLowerCase(),
    clientName: args.client.trim(),
    expiresAt: args.expires || null,
  };
  const privateKey = fs.readFileSync(privateKeyPath, "utf8");
  const signature = crypto
    .sign("sha256", Buffer.from(canonicalLicensePayload(payload)), privateKey)
    .toString("base64");
  const outPath = path.resolve(args.out || "license.lic");
  fs.writeFileSync(
    outPath,
    JSON.stringify({ payload, signature }, null, 2),
    "utf8",
  );
  console.log("Лицензия записана:", outPath);
}

main();
