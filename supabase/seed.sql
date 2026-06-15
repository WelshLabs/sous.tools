-- Seed Dtown Cafe organization
INSERT INTO organizations (id, name)
VALUES ('d0000000-0000-0000-0000-000000000000', 'Dtown Cafe')
ON CONFLICT (id) DO NOTHING;

-- Seed Admin User: conar@dtown.cafe / password
-- We insert into auth.users and auth.identities
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  role,
  aud,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  recovery_token,
  email_change_token_new,
  email_change,
  email_change_token_current,
  reauthentication_token
)
VALUES (
  'd0000000-0000-0000-0000-000000000000',
  '00000000-0000-0000-0000-000000000000',
  'conar@dtown.cafe',
  crypt('password', gen_salt('bf')),
  now(),
  'authenticated',
  'authenticated',
  '{"provider": "email", "providers": ["email"]}'::jsonb,
  '{"role": "authenticated"}'::jsonb,
  now(),
  now(),
  '',
  '',
  '',
  '',
  '',
  ''
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (
  id,
  user_id,
  identity_data,
  provider,
  provider_id,
  last_sign_in_at,
  created_at,
  updated_at
)
VALUES (
  'd0000000-0000-0000-0000-000000000000',
  'd0000000-0000-0000-0000-000000000000',
  '{"sub": "d0000000-0000-0000-0000-000000000000", "email": "conar@dtown.cafe"}'::jsonb,
  'email',
  'd0000000-0000-0000-0000-000000000000',
  now(),
  now(),
  now()
)
ON CONFLICT (provider, provider_id) DO NOTHING;

-- Seed Sample Vessel Profiles
INSERT INTO vessel_profiles (id, organization_id, name, shape, length, width, height, diameter, volume_ml)
VALUES 
  ('c0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000000', '9" Pullman Pan', 'RECTANGULAR', 23, 10, 10, NULL, 2300),
  ('c0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000000', '13" Pullman Pan', 'RECTANGULAR', 33, 10, 10, NULL, 3300),
  ('c0000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000000', '9" Round Cake Pan', 'ROUND', NULL, NULL, 5, 23, 2077)
ON CONFLICT (id) DO NOTHING;

-- Seed Sample Master Ingredients
INSERT INTO master_ingredients (id, organization_id, name, density_g_ml, nutrition_macros, allergens)
VALUES
  ('a0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000000', 'Bread Flour', 0.57, '{"calories": 364, "proteinG": 12, "carbsG": 76, "fatG": 1.5}'::jsonb, '["wheat"]'::jsonb),
  ('a0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000000', 'Water', 1.0, '{"calories": 0, "proteinG": 0, "carbsG": 0, "fatG": 0}'::jsonb, '[]'::jsonb),
  ('a0000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000000', 'Active Dry Yeast', 0.79, '{"calories": 325, "proteinG": 40, "carbsG": 41, "fatG": 7}'::jsonb, '[]'::jsonb),
  ('a0000000-0000-0000-0000-000000000004', 'd0000000-0000-0000-0000-000000000000', 'Fine Sea Salt', 1.2, '{"calories": 0, "proteinG": 0, "carbsG": 0, "fatG": 0}'::jsonb, '[]'::jsonb),
  ('a0000000-0000-0000-0000-000000000005', 'd0000000-0000-0000-0000-000000000000', 'Unsalted Butter', 0.96, '{"calories": 717, "proteinG": 0.9, "carbsG": 0.1, "fatG": 81}'::jsonb, '["dairy"]'::jsonb),
  ('a0000000-0000-0000-0000-000000000006', 'd0000000-0000-0000-0000-000000000000', 'Whole Milk', 1.03, '{"calories": 61, "proteinG": 3.2, "carbsG": 4.8, "fatG": 3.3}'::jsonb, '["dairy"]'::jsonb),
  ('a0000000-0000-0000-0000-000000000007', 'd0000000-0000-0000-0000-000000000000', 'Granulated Sugar', 0.84, '{"calories": 387, "proteinG": 0, "carbsG": 100, "fatG": 0}'::jsonb, '[]'::jsonb),
  ('a0000000-0000-0000-0000-000000000008', 'd0000000-0000-0000-0000-000000000000', 'Whole Egg', 1.02, '{"calories": 143, "proteinG": 12.6, "carbsG": 0.7, "fatG": 9.5}'::jsonb, '["egg"]'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- Seed Sample Recipes
INSERT INTO recipes (id, organization_id, title, yield_count, yield_unit, vessel_id, instructions)
VALUES
  (
    'beef0000-0000-0000-0000-000000000001',
    'd0000000-0000-0000-0000-000000000000',
    'Traditional Sourdough',
    2,
    'loaves',
    'c0000000-0000-0000-0000-000000000001',
    '[{"stepNumber": 1, "text": "Mix flour and water and let sit for autolyse.", "timerDurationSeconds": 1800}, {"stepNumber": 2, "text": "Add active dry yeast and salt. Knead until smooth.", "timerDurationSeconds": 600}]'::jsonb
  ),
  (
    'beef0000-0000-0000-0000-000000000002',
    'd0000000-0000-0000-0000-000000000000',
    'Classic Croissant',
    12,
    'pieces',
    'c0000000-0000-0000-0000-000000000003',
    '[{"stepNumber": 1, "text": "Mix bread flour, milk, sugar, yeast, and salt to form dough. Rest in fridge.", "timerDurationSeconds": 3600}, {"stepNumber": 2, "text": "Roll out butter block and laminate into dough with three folds.", "timerDurationSeconds": 1200}, {"stepNumber": 3, "text": "Shape croissant triangles, proof, brush with egg wash, and bake.", "timerDurationSeconds": 1500}]'::jsonb
  )
ON CONFLICT (id) DO NOTHING;

-- Seed Sample Recipe Ingredients
INSERT INTO recipe_ingredients (id, recipe_id, master_ingredient_id, calculation_type, base_calculation_group, amount, unit, prep_notes)
VALUES
  -- Traditional Sourdough ingredients
  ('b0000000-0000-0000-0000-000000000001', 'beef0000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'fixed_weight', true, 500, 'g', 'Use unbleached flour.'),
  ('b0000000-0000-0000-0000-000000000002', 'beef0000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', 'fixed_weight', false, 350, 'g', 'Filtered water at 75°F.'),
  ('b0000000-0000-0000-0000-000000000003', 'beef0000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000003', 'fixed_weight', false, 10, 'g', 'Ensure fresh active yeast.'),
  ('b0000000-0000-0000-0000-000000000004', 'beef0000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000004', 'fixed_weight', false, 10, 'g', 'Fine grey sea salt.'),
  
  -- Classic Croissant ingredients
  ('b0000000-0000-0000-0000-000000000005', 'beef0000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'fixed_weight', true, 500, 'g', 'Use premium pastry/bread flour.'),
  ('b0000000-0000-0000-0000-000000000006', 'beef0000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000005', 'fixed_weight', false, 250, 'g', 'European style high-fat butter.'),
  ('b0000000-0000-0000-0000-000000000007', 'beef0000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000006', 'fixed_weight', false, 150, 'g', 'Cold whole milk.'),
  ('b0000000-0000-0000-0000-000000000008', 'beef0000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000007', 'fixed_weight', false, 50, 'g', 'Granulated white sugar.'),
  ('b0000000-0000-0000-0000-000000000009', 'beef0000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000003', 'fixed_weight', false, 10, 'g', 'Instant or active dry yeast.'),
  ('b0000000-0000-0000-0000-000000000010', 'beef0000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000004', 'fixed_weight', false, 10, 'g', 'Fine sea salt.'),
  ('b0000000-0000-0000-0000-000000000011', 'beef0000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000008', 'fixed_weight', false, 50, 'g', 'Egg for glaze/wash.')
ON CONFLICT (id) DO NOTHING;

-- Seed Sample Square Items (POS Items)
INSERT INTO square_items (id, organization_id, square_id, name, description, price, is_sold_out)
VALUES
  ('f0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000000', 'item_coffee', 'Coffee', 'Freshly brewed drip coffee', 3.50, false),
  ('f0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000000', 'item_croissant', 'Croissant', 'Flaky butter croissant', 4.00, false),
  ('f0000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000000', 'item_avocado_toast', 'Avocado Toast', 'Sourdough toast with mashed avocado', 9.50, false),
  ('f0000000-0000-0000-0000-000000000004', 'd0000000-0000-0000-0000-000000000000', 'item_latte', 'Latte', 'Espresso with steamed milk', 4.50, false)
ON CONFLICT (organization_id, square_id) DO NOTHING;

-- Seed Sample Signage Deck (replaces signage_layouts)
INSERT INTO signage_decks (id, organization_id, name, slug, config)
VALUES (
  'd0000000-0000-0000-0000-000000000010',
  'd0000000-0000-0000-0000-000000000000',
  'Main Cafe Menu',
  'main-cafe-menu',
  '{"googleFont": "Outfit", "soldOutBehavior": "LABEL", "customCss": "", "slides": [{"id": "slide-menu-1", "type": "COLUMN_LAYOUT", "durationSeconds": 15, "columns": [{"type": "MENU", "itemIds": ["f0000000-0000-0000-0000-000000000001", "f0000000-0000-0000-0000-000000000002", "f0000000-0000-0000-0000-000000000003", "f0000000-0000-0000-0000-000000000004"], "highlightItems": [{"itemId": "f0000000-0000-0000-0000-000000000003", "style": "NEON_GLOW"}]}]}], "overlays": []}'::jsonb
)
ON CONFLICT (id) DO NOTHING;

-- Seed Sample Signage Displays (new schema: deck_id, no pairing_code/is_paired)
INSERT INTO signage_displays (id, organization_id, name, deck_id, device_id, port_label, last_seen_at)
VALUES
  ('d0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000000', 'Menu Screen Left', 'd0000000-0000-0000-0000-000000000010', NULL, NULL, now()),
  ('d0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000000', 'Menu Screen Right', NULL, NULL, NULL, NULL)
ON CONFLICT (id) DO NOTHING;
