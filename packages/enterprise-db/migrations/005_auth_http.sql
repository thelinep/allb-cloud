BEGIN;
CREATE TABLE auth_attempt_windows (
 key_hash text PRIMARY KEY CHECK(key_hash ~ '^[a-f0-9]{64}$'),
 window_started_at timestamptz NOT NULL, attempts integer NOT NULL CHECK(attempts>0)
);
COMMIT;
