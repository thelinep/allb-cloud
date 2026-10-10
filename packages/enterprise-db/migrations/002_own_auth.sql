BEGIN;
CREATE TABLE auth_accounts (
 user_id uuid PRIMARY KEY REFERENCES identities(id),
 email text NOT NULL UNIQUE CHECK(email=lower(btrim(email)) AND length(email) BETWEEN 3 AND 254),
 password_hash text NOT NULL CHECK(length(password_hash) BETWEEN 32 AND 1024),
 verified_at timestamptz, disabled_at timestamptz,
 credential_version integer NOT NULL DEFAULT 1 CHECK(credential_version>0),
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE auth_sessions (
 token_hash text PRIMARY KEY CHECK(token_hash ~ '^[a-f0-9]{64}$'),
 user_id uuid NOT NULL REFERENCES auth_accounts(user_id), credential_version integer NOT NULL CHECK(credential_version>0),
 authenticated_at timestamptz NOT NULL, expires_at timestamptz NOT NULL,
 last_seen_at timestamptz NOT NULL, revoked_at timestamptz, mfa_verified_at timestamptz,
 CHECK(expires_at>authenticated_at)
);
CREATE INDEX auth_sessions_user ON auth_sessions(user_id);
CREATE TABLE auth_invitations (
 id uuid PRIMARY KEY, organization_id uuid NOT NULL REFERENCES organizations(id),
 invited_by uuid NOT NULL, email text NOT NULL CHECK(email=lower(btrim(email))),
 role text NOT NULL CHECK(role IN ('owner','admin','editor','reviewer','viewer')),
 token_hash text NOT NULL UNIQUE CHECK(token_hash ~ '^[a-f0-9]{64}$'),
 created_at timestamptz NOT NULL DEFAULT now(), expires_at timestamptz NOT NULL,
 accepted_at timestamptz, revoked_at timestamptz,
 CHECK(expires_at>created_at),
 FOREIGN KEY(organization_id,invited_by) REFERENCES memberships(organization_id,user_id)
);
CREATE TABLE auth_challenges (
 token_hash text PRIMARY KEY CHECK(token_hash ~ '^[a-f0-9]{64}$'),
 user_id uuid NOT NULL REFERENCES auth_accounts(user_id),
 purpose text NOT NULL CHECK(purpose IN ('verify_email','recover_account','enroll_mfa')),
 created_at timestamptz NOT NULL DEFAULT now(), expires_at timestamptz NOT NULL,
 consumed_at timestamptz, CHECK(expires_at>created_at)
);
CREATE TABLE auth_mfa_factors (
 id uuid PRIMARY KEY, user_id uuid NOT NULL REFERENCES auth_accounts(user_id),
 kind text NOT NULL CHECK(kind IN ('totp','webauthn')),
 encrypted_secret bytea NOT NULL, encryption_key_version text NOT NULL,
 confirmed_at timestamptz, revoked_at timestamptz, last_counter bigint CHECK(last_counter>=0),
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE auth_recovery_codes (
 user_id uuid NOT NULL REFERENCES auth_accounts(user_id),
 code_hash text NOT NULL CHECK(code_hash ~ '^[a-f0-9]{64}$'), consumed_at timestamptz,
 PRIMARY KEY(user_id,code_hash)
);
COMMIT;
