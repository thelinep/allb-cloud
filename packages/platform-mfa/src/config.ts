/**
 * Exact port of nevo-event-os-3's apps/web/lib/webauthn.ts `webAuthnConfig`
 * - already framework/storage-agnostic (pure function of a Request + env),
 * so nothing needed to change to make it shareable.
 */
export interface WebAuthnEnvironment {
  [key: string]: string | undefined;
}

export interface WebAuthnConfig {
  rpID: string;
  origin: string;
  rpName: string;
}

export function webAuthnConfig(
  request: Request,
  environment: WebAuthnEnvironment = process.env,
  rpName = "NEVO",
): WebAuthnConfig | null {
  if (environment.NEVO_FIDO_ENABLED !== "1") return null;
  const origin = environment.NEVO_WEBAUTHN_ORIGIN?.trim() || new URL(request.url).origin;
  const url = new URL(origin);
  const rpID = environment.NEVO_WEBAUTHN_RP_ID?.trim() || url.hostname;
  const loopback = url.hostname === "localhost" || url.hostname === "127.0.0.1" || url.hostname === "::1";
  if (url.protocol !== "https:" && !loopback) throw new Error("WebAuthn requires an HTTPS origin outside local development");
  if (rpID !== url.hostname) throw new Error("WebAuthn RP ID must match the configured origin hostname");
  return { rpID, origin, rpName };
}
