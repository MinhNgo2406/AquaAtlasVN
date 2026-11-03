CREATE TABLE IF NOT EXISTS aquariums (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  volume_liters INTEGER NOT NULL CHECK (volume_liters > 0),
  fish_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS aquariums_user_idx ON aquariums(user_id, created_at);

CREATE TABLE IF NOT EXISTS care_tasks (
  id BIGSERIAL PRIMARY KEY,
  aquarium_id BIGINT NOT NULL REFERENCES aquariums(id) ON DELETE CASCADE,
  title VARCHAR(160) NOT NULL,
  due_date DATE NOT NULL,
  cadence_days INTEGER CHECK (cadence_days IS NULL OR cadence_days BETWEEN 1 AND 365),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS care_tasks_due_idx ON care_tasks(aquarium_id, due_date);

CREATE TABLE IF NOT EXISTS care_logs (
  id BIGSERIAL PRIMARY KEY,
  aquarium_id BIGINT NOT NULL REFERENCES aquariums(id) ON DELETE CASCADE,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  task_id BIGINT REFERENCES care_tasks(id) ON DELETE SET NULL,
  title VARCHAR(160) NOT NULL,
  note TEXT NOT NULL DEFAULT '',
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS care_logs_aquarium_idx ON care_logs(aquarium_id, completed_at DESC);

CREATE TABLE IF NOT EXISTS content_reports (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  target_type VARCHAR(20) NOT NULL CHECK (target_type IN ('fish', 'shop')),
  target_id VARCHAR(100) NOT NULL,
  target_label VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'reviewing', 'resolved', 'dismissed')),
  admin_note TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS content_reports_status_idx ON content_reports(status, created_at DESC);
