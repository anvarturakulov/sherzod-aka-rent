import { execFileSync } from "child_process";
import * as crypto from "crypto";
import * as fs from "fs";
import * as path from "path";

/** Открытый ключ. Секретный лежит только в backend/license-keys/private.pem и клиенту не отдаётся. */
export const LICENSE_PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAnQCMmihg8E0chafHNRd2
WMaeZGSL21LYNCkwaCvKiTXnP9/vJCkd7ebaSycsgXdHv5FKUUycOchPvyL4+BE7
OEbWJdP0/UawZzvReXCEVmdpT7JwTNTd+Hv4XdpMcJ9+qR+8TBBvp06yrS7P1WQq
T0bWkFdhNl8z1ny2SUbCykEWJ1wldjE4z922lL0lOP4n/cCNl4UsesixxNqMNtPX
zIFZjl6ShyOtFJu+fCBvblWht3d6nibiw3hWTbF80yF4tJXJa3CfTdDum5LPWcY/
rU/KSHrSvmlaNcOL2v0v7w6yUOGw9YYX5/x0KNc9o80bPxpIdL4VgJJt49qSAs26
nwIDAQAB
-----END PUBLIC KEY-----
`;

export type LicensePayload = {
  machineGuid: string;
  clientName: string;
  expiresAt: string | null;
};

export function canonicalLicensePayload(payload: LicensePayload): string {
  return JSON.stringify({
    machineGuid: String(payload.machineGuid || "").trim().toLowerCase(),
    clientName: String(payload.clientName || "").trim(),
    expiresAt: payload.expiresAt ? String(payload.expiresAt) : null,
  });
}

export function verifyLicenseContent(
  raw: string,
  publicKeyPem: string,
  machineGuid: string,
  now: Date = new Date(),
): LicensePayload {
  let parsed: { payload?: LicensePayload; signature?: string };
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("Файл лицензии повреждён.");
  }
  if (!parsed?.payload || !parsed.signature) {
    throw new Error("Файл лицензии повреждён.");
  }

  const payload: LicensePayload = {
    machineGuid: String(parsed.payload.machineGuid || ""),
    clientName: String(parsed.payload.clientName || ""),
    expiresAt: parsed.payload.expiresAt
      ? String(parsed.payload.expiresAt)
      : null,
  };
  const data = Buffer.from(canonicalLicensePayload(payload));
  const signature = Buffer.from(parsed.signature, "base64");
  const ok = crypto.verify("sha256", data, publicKeyPem, signature);
  if (!ok) {
    throw new Error("Подпись лицензии не совпадает.");
  }

  const expected = machineGuid.trim().toLowerCase();
  if (payload.machineGuid.trim().toLowerCase() !== expected) {
    throw new Error("Лицензия выдана для другого компьютера.");
  }

  if (payload.expiresAt) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(payload.expiresAt)) {
      throw new Error("В лицензии некорректная дата окончания.");
    }
    const end = new Date(`${payload.expiresAt}T23:59:59`);
    if (Number.isNaN(end.getTime()) || now.getTime() > end.getTime()) {
      throw new Error("Срок лицензии истёк.");
    }
  }

  return {
    machineGuid: payload.machineGuid.trim().toLowerCase(),
    clientName: payload.clientName.trim(),
    expiresAt: payload.expiresAt,
  };
}

export function readWindowsMachineGuid(): string {
  if (process.platform !== "win32") {
    throw new Error("Привязка лицензии поддерживается только на Windows.");
  }
  const out = execFileSync(
    "reg",
    ["query", "HKLM\\SOFTWARE\\Microsoft\\Cryptography", "/v", "MachineGuid"],
    { encoding: "utf8" },
  );
  const match = out.match(/MachineGuid\s+REG_SZ\s+(\S+)/i);
  if (!match?.[1]) {
    throw new Error("Не удалось прочитать MachineGuid.");
  }
  return match[1].trim();
}

/** Пропуск только при явном LICENSE_REQUIRED=false. Иначе лицензия обязательна. */
export function isLicenseCheckSkipped(
  licenseRequired: string | undefined = process.env.LICENSE_REQUIRED,
): boolean {
  return licenseRequired === "false";
}

/** При пропуске ничего не делает. Иначе процесс завершается до открытия порта, если лицензия недействительна. */
export function assertMachineLicense(cwd = process.cwd()): void {
  if (isLicenseCheckSkipped()) return;

  let guid = "";
  try {
    guid = readWindowsMachineGuid();
    const file = process.env.LICENSE_FILE
      ? path.resolve(process.env.LICENSE_FILE)
      : path.join(cwd, "license.lic");
    if (!fs.existsSync(file)) {
      throw new Error(`Лицензия не найдена: ${file}`);
    }
    const raw = fs.readFileSync(file, "utf8");
    const payload = verifyLicenseContent(raw, LICENSE_PUBLIC_KEY, guid);
    const until = payload.expiresAt ? `, до ${payload.expiresAt}` : "";
    console.log(`Лицензия: ${payload.clientName}${until}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(message);
    if (guid) {
      console.error(`MachineGuid этого компьютера: ${guid}`);
    }
    process.exit(1);
  }
}
