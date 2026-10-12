/**
 * bcrypt password hashing, matching ne-2's exact cost factor (12) so this
 * is a drop-in replacement for its inline `bcrypt.hash(password, 12)` /
 * `bcrypt.compare(...)` calls - existing stored hashes remain verifiable.
 */
import bcrypt from "bcrypt";

const DEFAULT_COST = 12;

export async function bcryptHashPassword(password: string, cost = DEFAULT_COST): Promise<string> {
  return bcrypt.hash(password, cost);
}

export async function bcryptVerifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
