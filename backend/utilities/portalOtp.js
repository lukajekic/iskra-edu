import crypto from "crypto";

const BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

export const generatePortalOtpSecret = () => {
  const bytes = crypto.randomBytes(20);
  let bits = 0;
  let value = 0;
  let encoded = "";

  for (const byte of bytes) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      encoded += BASE32_ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }

  if (bits > 0) encoded += BASE32_ALPHABET[(value << (5 - bits)) & 31];
  return encoded;
};

const getEncryptionKey = () => {
  if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET is required to protect portal OTP secrets");
  return crypto.createHmac("sha256", process.env.JWT_SECRET).update("iskra-portal-otp-encryption-v1").digest();
};

export const encryptPortalOtpSecret = (secret) => {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", getEncryptionKey(), iv);
  const ciphertext = Buffer.concat([cipher.update(secret, "utf8"), cipher.final()]);
  return ["v1", iv.toString("base64url"), cipher.getAuthTag().toString("base64url"), ciphertext.toString("base64url")].join(".");
};

export const decryptPortalOtpSecret = (encryptedSecret) => {
  const [version, encodedIv, encodedTag, encodedCiphertext] = String(encryptedSecret).split(".");
  if (version !== "v1" || !encodedIv || !encodedTag || !encodedCiphertext) {
    throw new Error("Invalid encrypted portal OTP secret");
  }

  const decipher = crypto.createDecipheriv("aes-256-gcm", getEncryptionKey(), Buffer.from(encodedIv, "base64url"));
  decipher.setAuthTag(Buffer.from(encodedTag, "base64url"));
  return Buffer.concat([
    decipher.update(Buffer.from(encodedCiphertext, "base64url")),
    decipher.final()
  ]).toString("utf8");
};

const decodeBase32 = (secret) => {
  const normalized = secret.replace(/=+$/u, "").toUpperCase();
  let bits = 0;
  let value = 0;
  const bytes = [];

  for (const character of normalized) {
    const digit = BASE32_ALPHABET.indexOf(character);
    if (digit === -1) throw new Error("Invalid Base32 OTP secret");
    value = (value << 5) | digit;
    bits += 5;
    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }

  return Buffer.from(bytes);
};

const codeForCounter = (secret, counter) => {
  const key = decodeBase32(secret);
  const message = Buffer.alloc(8);
  message.writeBigUInt64BE(BigInt(counter));
  const digest = crypto.createHmac("sha1", key).update(message).digest();
  const offset = digest[digest.length - 1] & 0x0f;
  const binary = digest.readUInt32BE(offset) & 0x7fffffff;
  return String(binary % 1_000_000).padStart(6, "0");
};

export const matchPortalOtpCounter = (secret, submittedCode, now = Date.now()) => {
  if (typeof submittedCode !== "string" || !/^\d{6}$/u.test(submittedCode)) return null;

  const submitted = Buffer.from(submittedCode);
  const currentCounter = Math.floor(now / 30_000);
  for (let offset = -1; offset <= 1; offset += 1) {
    const counter = currentCounter + offset;
    const expected = Buffer.from(codeForCounter(secret, counter));
    if (crypto.timingSafeEqual(submitted, expected)) return counter;
  }

  return null;
};

export const verifyPortalOtp = (secret, submittedCode, now = Date.now()) =>
  matchPortalOtpCounter(secret, submittedCode, now) !== null;

export const buildPortalOtpUri = (secret, username) => {
  const label = encodeURIComponent(`Iskra-portal:${username}`);
  const parameters = new URLSearchParams({
    secret,
    issuer: "Iskra administrativni portal",
    algorithm: "SHA1",
    digits: "6",
    period: "30",
  });
  return `otpauth://totp/${label}?${parameters.toString()}`;
};