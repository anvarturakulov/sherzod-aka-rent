import { execFileSync } from "child_process";
import * as crypto from "crypto";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import {
  canonicalLicensePayload,
  isLicenseCheckSkipped,
  LICENSE_PUBLIC_KEY,
  verifyLicenseContent,
  type LicensePayload,
} from "./machine-license";

function sign(payload: LicensePayload, privateKey: string): string {
  const data = Buffer.from(canonicalLicensePayload(payload));
  return crypto.sign("sha256", data, privateKey).toString("base64");
}

describe("machine license", () => {
  const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
    modulusLength: 2048,
    publicKeyEncoding: { type: "spki", format: "pem" },
    privateKeyEncoding: { type: "pkcs8", format: "pem" },
  });

  const guid = "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee";

  function license(payload: LicensePayload, key = privateKey): string {
    return JSON.stringify({
      payload,
      signature: sign(payload, key),
    });
  }

  it("пропускает проверку только при LICENSE_REQUIRED=false", () => {
    expect(isLicenseCheckSkipped("false")).toBe(true);
    expect(isLicenseCheckSkipped(undefined)).toBe(false);
    expect(isLicenseCheckSkipped("")).toBe(false);
    expect(isLicenseCheckSkipped("true")).toBe(false);
    expect(isLicenseCheckSkipped("TRUE")).toBe(false);
    expect(isLicenseCheckSkipped("False")).toBe(false);
  });

  it("принимает подпись для этого компьютера", () => {
    const payload: LicensePayload = {
      machineGuid: guid.toUpperCase(),
      clientName: "Клиент",
      expiresAt: "2099-01-01",
    };
    const result = verifyLicenseContent(
      license(payload),
      publicKey,
      guid,
      new Date("2026-09-30T12:00:00"),
    );
    expect(result.clientName).toBe("Клиент");
    expect(result.machineGuid).toBe(guid);
  });

  it("отклоняет лицензию другого компьютера", () => {
    const payload: LicensePayload = {
      machineGuid: guid,
      clientName: "Клиент",
      expiresAt: null,
    };
    expect(() =>
      verifyLicenseContent(
        license(payload),
        publicKey,
        "другой-guid",
        new Date("2026-09-30T12:00:00"),
      ),
    ).toThrow("другого компьютера");
  });

  it("отклоняет чужую подпись и просроченную лицензию", () => {
    const other = crypto.generateKeyPairSync("rsa", {
      modulusLength: 2048,
      publicKeyEncoding: { type: "spki", format: "pem" },
      privateKeyEncoding: { type: "pkcs8", format: "pem" },
    });
    const payload: LicensePayload = {
      machineGuid: guid,
      clientName: "Клиент",
      expiresAt: null,
    };
    expect(() =>
      verifyLicenseContent(license(payload, other.privateKey), publicKey, guid),
    ).toThrow("Подпись");

    const expired: LicensePayload = {
      machineGuid: guid,
      clientName: "Клиент",
      expiresAt: "2020-01-01",
    };
    expect(() =>
      verifyLicenseContent(
        license(expired),
        publicKey,
        guid,
        new Date("2026-09-30T12:00:00"),
      ),
    ).toThrow("истёк");
  });

  it("файл от scripts/issue-license.js проходит проверку встроенным ключом", () => {
    const out = path.join(os.tmpdir(), `kord-license-${Date.now()}.lic`);
    execFileSync(
      process.execPath,
      [
        path.join(__dirname, "../../scripts/issue-license.js"),
        "--guid",
        guid,
        "--client",
        "Клиент",
        "--expires",
        "2099-01-01",
        "--out",
        out,
      ],
      { cwd: path.join(__dirname, "../..") },
    );
    const raw = fs.readFileSync(out, "utf8");
    fs.unlinkSync(out);
    const result = verifyLicenseContent(
      raw,
      LICENSE_PUBLIC_KEY,
      guid,
      new Date("2026-09-30T12:00:00"),
    );
    expect(result.clientName).toBe("Клиент");
  });
});
