-- One-time data migration is recorded by the backend after it inserts missing
-- starter species from db/seeds/fish.json. The catalog migration marker prevents
-- removed species from being re-added on later restarts.
CREATE TABLE IF NOT EXISTS schema_migrations (
  version VARCHAR(120) PRIMARY KEY,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
