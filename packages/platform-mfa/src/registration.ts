/**
 * Thin wrappers around @simplewebauthn/server, factored out of
 * nevo-event-os-3's four FIDO route handlers where the options-shaping
 * (excludeCredentials/allowCredentials mapping from a comma-joined
 * `transports` string) was duplicated inline. `requireUserVerification`
 * is hardcoded to `true` in the verify wrappers - both original routes
 * hardcoded it too; centralizing it here means a future call site can't
 * silently omit that security-relevant flag.
 */
import {
  generateAuthenticationOptions,
  generateRegistrationOptions,
  verifyAuthenticationResponse,
  verifyRegistrationResponse,
  type AuthenticationResponseJSON,
  type RegistrationResponseJSON,
  type WebAuthnCredential,
} from "@simplewebauthn/server";

export interface ExistingCredentialRef {
  credentialId: string;
  transports?: string | null;
}

function credentialRefs(credentials: ExistingCredentialRef[]) {
  return credentials.map((credential) => ({
    id: credential.credentialId,
    transports: credential.transports?.split(",").filter(Boolean) as never,
  }));
}

export async function buildRegistrationOptions(params: {
  rpName: string;
  rpID: string;
  userId: string;
  userEmail: string;
  userDisplayName: string;
  existingCredentials: ExistingCredentialRef[];
}) {
  return generateRegistrationOptions({
    rpName: params.rpName,
    rpID: params.rpID,
    userID: new TextEncoder().encode(params.userId),
    userName: params.userEmail,
    userDisplayName: params.userDisplayName,
    attestationType: "none",
    authenticatorSelection: { residentKey: "preferred", userVerification: "required" },
    excludeCredentials: credentialRefs(params.existingCredentials),
  });
}

export async function buildAuthenticationOptions(params: {
  rpID: string;
  allowCredentials: ExistingCredentialRef[];
}) {
  return generateAuthenticationOptions({
    rpID: params.rpID,
    userVerification: "required",
    allowCredentials: credentialRefs(params.allowCredentials),
  });
}

export async function verifyRegistration(params: {
  response: RegistrationResponseJSON;
  expectedChallenge: string;
  expectedOrigin: string;
  expectedRPID: string;
}) {
  return verifyRegistrationResponse({ ...params, requireUserVerification: true });
}

export async function verifyAuthentication(params: {
  response: AuthenticationResponseJSON;
  expectedChallenge: string;
  expectedOrigin: string;
  expectedRPID: string;
  credential: WebAuthnCredential;
}) {
  return verifyAuthenticationResponse({ ...params, requireUserVerification: true });
}
