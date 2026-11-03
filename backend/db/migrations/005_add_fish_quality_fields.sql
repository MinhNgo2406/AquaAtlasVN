-- Add structured filter and source-review metadata while preserving admin edits.
CREATE TABLE IF NOT EXISTS schema_migrations (
  version VARCHAR(120) PRIMARY KEY,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM schema_migrations WHERE version = '005_add_fish_quality_fields') THEN
    UPDATE fish
       SET data = data || jsonb_build_object(
         'minTankLiters', COALESCE(data->'minTankLiters', '20'::jsonb),
         'temperament', COALESCE(data->'temperament', '"independent"'::jsonb),
         'compatibilityGroup', COALESCE(data->'compatibilityGroup', '"separate"'::jsonb),
         'reviewedAt', COALESCE(data->'reviewedAt', '"2026-11-03"'::jsonb),
         'dataStatus', COALESCE(data->'dataStatus', '"reviewed"'::jsonb)
       ),
       updated_at = NOW()
     WHERE id = 'betta';

    UPDATE fish
       SET data = data || jsonb_build_object(
         'minTankLiters', COALESCE(data->'minTankLiters', '45'::jsonb),
         'temperament', COALESCE(data->'temperament', '"peaceful"'::jsonb),
         'compatibilityGroup', COALESCE(data->'compatibilityGroup', '"community"'::jsonb),
         'reviewedAt', COALESCE(data->'reviewedAt', '"2026-11-03"'::jsonb),
         'dataStatus', COALESCE(data->'dataStatus', '"reviewed"'::jsonb)
       ),
       updated_at = NOW()
     WHERE id IN ('guppy', 'neon', 'cardinal-tetra', 'ember-tetra', 'rummy-nose-tetra', 'platy');

    UPDATE fish
       SET data = data || jsonb_build_object(
         'minTankLiters', COALESCE(data->'minTankLiters', '120'::jsonb),
         'temperament', COALESCE(data->'temperament', '"active"'::jsonb),
         'compatibilityGroup', COALESCE(data->'compatibilityGroup', '"community"'::jsonb),
         'reviewedAt', COALESCE(data->'reviewedAt', '"2026-11-03"'::jsonb),
         'dataStatus', COALESCE(data->'dataStatus', '"reviewed"'::jsonb)
       ),
       updated_at = NOW()
     WHERE id = 'boesemani-rainbowfish';

    UPDATE fish
       SET data = data || jsonb_build_object(
         'minTankLiters', COALESCE(data->'minTankLiters', '100'::jsonb),
         'temperament', COALESCE(data->'temperament', '"active"'::jsonb),
         'compatibilityGroup', COALESCE(data->'compatibilityGroup', '"coldwater-community"'::jsonb),
         'reviewedAt', COALESCE(data->'reviewedAt', '"2026-11-03"'::jsonb),
         'dataStatus', COALESCE(data->'dataStatus', '"reviewed"'::jsonb)
       ),
       updated_at = NOW()
     WHERE id = 'goldfish';

    UPDATE fish
       SET data = data || jsonb_build_object(
         'minTankLiters', COALESCE(data->'minTankLiters', '100'::jsonb),
         'temperament', COALESCE(data->'temperament', '"semi-aggressive"'::jsonb),
         'compatibilityGroup', COALESCE(data->'compatibilityGroup', '"large-community"'::jsonb),
         'reviewedAt', COALESCE(data->'reviewedAt', '"2026-11-03"'::jsonb),
         'dataStatus', COALESCE(data->'dataStatus', '"reviewed"'::jsonb)
       ),
       updated_at = NOW()
     WHERE id = 'angelfish';

    INSERT INTO schema_migrations (version) VALUES ('005_add_fish_quality_fields');
  END IF;
END $$;
