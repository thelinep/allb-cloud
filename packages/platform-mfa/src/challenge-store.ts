/**
 * Exact port of nevo-event-os-3's apps/web/lib/webauthn.ts challenge-store
 * functions, generalized over a minimal delegate interface instead of a
 * concrete Prisma import - so this package has no Prisma dependency, and
 * any Prisma `WebAuthnChallenge` model shaped like nevo-event-os-3's
 * satisfies it structurally with no adapter code needed.
 *
 * Atomicity note: the original code ran delete+create inside a single
 * `db.$transaction([...])`. To keep that exact guarantee without a
 * PrismaClient dependency here, call this from inside your own
 * `db.$transaction(async (tx) => { await saveWebAuthnChallenge(tx.webAuthnChallenge, ...) })`
 * - a Prisma transaction client's model delegate satisfies this interface
 * identically to the top-level client's.
 */

const CHALLENGE_TTL_MS = 5 * 60_000;

export interface WebAuthnChallengeRow {
  id: string;
  challenge: string;
}

export interface WebAuthnChallengeDelegate {
  deleteMany(args: { where: { userId: string; type: string } }): Promise<{ count: number }>;
  create(args: { data: { userId: string; type: string; challenge: string; expiresAt: Date } }): Promise<unknown>;
  findFirst(args: {
    where: { userId: string; type: string; usedAt: null; expiresAt: { gt: Date } };
    orderBy: { createdAt: "desc" };
  }): Promise<WebAuthnChallengeRow | null>;
  updateMany(args: { where: { id: string; usedAt: null }; data: { usedAt: Date } }): Promise<{ count: number }>;
}

export async function saveWebAuthnChallenge(
  delegate: WebAuthnChallengeDelegate,
  userId: string,
  type: string,
  challenge: string,
): Promise<void> {
  const expiresAt = new Date(Date.now() + CHALLENGE_TTL_MS);
  await delegate.deleteMany({ where: { userId, type } });
  await delegate.create({ data: { userId, type, challenge, expiresAt } });
}

export async function consumeWebAuthnChallenge(
  delegate: WebAuthnChallengeDelegate,
  userId: string,
  type: string,
): Promise<string | null> {
  const candidate = await delegate.findFirst({
    where: { userId, type, usedAt: null, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: "desc" },
  });
  if (!candidate) return null;
  const used = await delegate.updateMany({ where: { id: candidate.id, usedAt: null }, data: { usedAt: new Date() } });
  return used.count === 1 ? candidate.challenge : null;
}
