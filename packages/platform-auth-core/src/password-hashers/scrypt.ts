/**
 * scrypt password hashing, matching nevo-event-os-3's exact stored format
 * (`<hexSalt>:<hexHash>`, 16-byte salt, 64-byte derived key) so this is a
 * drop-in replacement for its inline lib/nevo-auth.ts implementation -
 * existing stored hashes remain verifiable. Deliberately NOT unified with
 * bcrypt.ts above - the two repos picked different algorithms and neither
 * can verify the other's stored hashes, so both are kept as separate,
 * real adapters rather than a forced single default.
 */
import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(scryptCallback);

export async function scryptHashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const derived = (await scrypt(password, salt, 64)) as Buffer;
  return `${salt}:${derived.toString("hex")}`;
}

export async function scryptVerifyPassword(password: string, stored: string): Promise<boolean> {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const derived = (await scrypt(password, salt, 64)) as Buffer;
  const storedHash = Buffer.from(hash, "hex");
  return storedHash.length === derived.length && timingSafeEqual(derived, storedHash);
}
