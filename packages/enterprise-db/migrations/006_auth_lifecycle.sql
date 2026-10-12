BEGIN;
ALTER TABLE auth_sessions ADD COLUMN id uuid NOT NULL DEFAULT gen_random_uuid();
CREATE UNIQUE INDEX auth_session_public_id ON auth_sessions(id);
CREATE TABLE auth_delivery_outbox (
 id uuid PRIMARY KEY, recipient text NOT NULL, kind text NOT NULL CHECK(kind IN ('recovery','invitation')),
 encrypted_payload bytea NOT NULL, encryption_key_version text NOT NULL,
 created_at timestamptz NOT NULL, expires_at timestamptz NOT NULL, delivered_at timestamptz,
 CHECK(expires_at>created_at)
);
CREATE INDEX auth_delivery_pending ON auth_delivery_outbox(created_at) WHERE delivered_at IS NULL;
CREATE TABLE auth_security_events (
 id uuid PRIMARY KEY, user_id uuid NOT NULL REFERENCES auth_accounts(user_id), action text NOT NULL, occurred_at timestamptz NOT NULL, details jsonb NOT NULL DEFAULT '{}'
);
COMMIT;
