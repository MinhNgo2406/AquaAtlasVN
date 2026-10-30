-- Correct the license labels for photos already installed by migration 003.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM schema_migrations WHERE version = '004_correct_image_attributions') THEN
    UPDATE fish
       SET data = jsonb_set(data, '{imageCredit}', '"Usien · CC BY-SA 4.0 · Wikimedia Commons"'::jsonb),
           updated_at = NOW()
     WHERE id = 'platy'
       AND data->>'image' = 'https://commons.wikimedia.org/wiki/Special:FilePath/Xiphophorus_maculatus_Platy.JPG?width=1200';

    UPDATE fish
       SET data = jsonb_set(data, '{imageCredit}', '"Usien · CC BY 3.0 · Wikimedia Commons"'::jsonb),
           updated_at = NOW()
     WHERE id = 'ember-tetra'
       AND data->>'image' = 'https://commons.wikimedia.org/wiki/Special:FilePath/Funkensalmler_Feuertetra_oder_Feuersalmler_Hyphessobrycon_amandae.JPG?width=1200';

    INSERT INTO schema_migrations (version) VALUES ('004_correct_image_attributions');
  END IF;
END $$;
