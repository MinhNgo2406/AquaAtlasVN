CREATE TABLE IF NOT EXISTS users (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  email VARCHAR(254) NOT NULL,
  display_name VARCHAR(100) NOT NULL,
  password_hash TEXT NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'customer',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT users_email_normalized CHECK (email = LOWER(BTRIM(email)) AND email <> ''),
  CONSTRAINT users_display_name_not_empty CHECK (LENGTH(BTRIM(display_name)) > 0),
  CONSTRAINT users_password_hash_not_empty CHECK (LENGTH(password_hash) > 0),
  CONSTRAINT users_role_allowed CHECK (role IN ('customer', 'admin'))
);

CREATE UNIQUE INDEX IF NOT EXISTS users_email_unique_idx ON users (email);

CREATE OR REPLACE FUNCTION set_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS users_updated_at_trigger ON users;
CREATE TRIGGER users_updated_at_trigger
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION set_users_updated_at();
