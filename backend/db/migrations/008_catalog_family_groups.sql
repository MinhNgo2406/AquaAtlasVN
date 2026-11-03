UPDATE fish SET data = jsonb_set(data, '{family}', '"betta"'::jsonb, true) WHERE id = 'betta' AND NOT (data ? 'family');
UPDATE fish SET data = jsonb_set(data, '{family}', '"livebearer"'::jsonb, true) WHERE id IN ('guppy', 'platy') AND NOT (data ? 'family');
UPDATE fish SET data = jsonb_set(data, '{family}', '"tetra"'::jsonb, true) WHERE id IN ('neon', 'cardinal-tetra', 'ember-tetra', 'rummy-nose-tetra') AND NOT (data ? 'family');
UPDATE fish SET data = jsonb_set(data, '{family}', '"rainbowfish"'::jsonb, true) WHERE id = 'boesemani-rainbowfish' AND NOT (data ? 'family');
UPDATE fish SET data = jsonb_set(data, '{family}', '"coldwater"'::jsonb, true) WHERE id = 'goldfish' AND NOT (data ? 'family');
UPDATE fish SET data = jsonb_set(data, '{family}', '"cichlid"'::jsonb, true) WHERE id = 'angelfish' AND NOT (data ? 'family');
