--
-- INSERT INTO AUTH
--
-- INSERT INTO
--   auth.users (
--     instance_id,
--     id,
--     aud,
--     role,
--     email,
--     encrypted_password,
--     email_confirmed_at,
--     invited_at,
--     confirmation_token,
--     confirmation_sent_at,
--     recovery_token,
--     recovery_sent_at,
--     email_change_token_new,
--     email_change,
--     email_change_sent_at,
--     last_sign_in_at,
--     raw_app_meta_data,
--     raw_user_meta_data,
--     is_super_admin,
--     created_at,
--     updated_at,
--     phone,
--     phone_confirmed_at,
--     phone_change,
--     phone_change_token,
--     phone_change_sent_at,
--     email_change_token_current,
--     email_change_confirm_status,
--     banned_until,
--     reauthentication_token,
--     reauthentication_sent_at,
--     is_sso_user
--   )
-- VALUES
--   (
--     '00000000-0000-0000-0000-000000000000',
--     '641b5d66-ac2b-4b60-9f83-2941ce477fb3',
--     'authenticated',
--     'authenticated',
--     'schimmellilian@gmail.com',
--     '$2a$10$J3rFbmcfgmvb9YkgI5RYz.ph.OuJtvimy7pRwORw4D.bcoSA13MA2',
--     '2023-03-20 00:08:08.271582+00',
--     NULL,
--     NULL,
--     NULL,
--     NULL,
--     NULL,
--     NULL,
--     NULL,
--     NULL,
--     '2023-03-20 00:08:08.274323+00',
--     '{ "provider": "email","providers": ["email"] }',
--     '{ }',
--     NULL,
--     '2023-03-20 00:08:08.261351+00',
--     '2023-03-20 01:07:42.680308+00',
--     NULL,
--     NULL,
--     NULL,
--     NULL,
--     NULL,
--     NULL,
--     NULL,
--     NULL,
--     NULL,
--     NULL,
--     false
--   ),
--   (
--     '00000000-0000-0000-0000-000000000000',
--     '18eb4a3b-2bb3-4f3d-a9bb-1de3211916ec',
--     'authenticated',
--     'authenticated',
--     'trw0511@yahoo.com',
--     '$2a$10$V.b/KZJ.oWWmfLC/vpSkpeHgNDHEFPzEIl7hvs9XWAl6Xjf9dw99W',
--     '2023-03-18 02:46:25.425941+00',
--     NULL,
--     NULL,
--     NULL,
--     NULL,
--     NULL,
--     NULL,
--     NULL,
--     NULL,
--     '2023-03-20 02:32:29.452146+00',
--     '{ "provider": "email", "providers": ["email"] }',
--     '{ }',
--     NULL,
--     '2023-03-18 02:46:25.422049+00',
--     '2023-03-20 02:32:29.458036+00',
--     NULL,
--     NULL,
--     NULL,
--     NULL,
--     NULL,
--     NULL,
--     NULL,
--     NULL,
--     NULL,
--     NULL,
--     false
--   );
-- --
-- -- UPDATE PROFILES
-- --
-- UPDATE
--   public.profiles
-- SET
--   first_name = 'Taylor',
--   last_name = 'Winowiecki',
--   square_id = null,
--   updated_at = '2023-03-18 18:43:09.673+00'
-- WHERE
--   id = '18eb4a3b-2bb3-4f3d-a9bb-1de3211916ec';
-- UPDATE
--   public.profiles
-- SET
--   first_name = 'Lily',
--   last_name = 'Schwick',
--   square_id = null,
--   updated_at = null
-- WHERE
--   id = '641b5d66-ac2b-4b60-9f83-2941ce477fb3';
--
-- INSERT INTO PUBLIC TABLES
--
INSERT INTO
  public.featured_groups (id, title, start_date, end_date, created_at)
VALUES
  (
    1,
    'Fun new necklaces',
    '2023-03-17 04:00:00+00',
    '2026-10-18 19:35:40+00',
    '2023-03-18 19:35:49+00'
  ),
  (
    2,
    'Cute lil accessories',
    '2023-03-18 21:32:21+00',
    '2026-03-18 21:40:31+00',
    '2023-03-18 21:32:42+00'
  );

INSERT INTO
  public.featured_products (id, group_id)
VALUES
  ('2WMCSYAZ6PIL5TVRZESYLZ6N', 1),
  ('N65CZYT3XTLWLOITNNKFRQ7I', 1),
  ('Y5UNLPKSLX7HIHLQI7APGVMR', 1),
  ('UNL5QC6LYEGNFIUJ76IEOS2O', 1),
  ('HSE7ZRNLRBFYJAM3OOUQGZ5I', 1),
  ('ENN42MQKBT2XTV5P7ZOTBBGU', 1),
  ('KFN6PWEVZ22X4JGQG3HR22AG', 1),
  ('CSB3QMOUJF2J5QM22OPJJB6N', 1),
  ('VGM2NMYJBRBCSLYSVRW7ILAM', 1),
  ('AWU5HLHS2C5DECAVDWTL5Z65', 1),
  ('Y6LLSSCUVL3GPEXUZYP7B4HV', 1),
  ('5MTPUTO3UKXAQAI3N3AIEY5U', 1),
  ('SU6YLKNDP62MIKBRMIAMAWPE', 1),
  ('QJQX54I4Q6LHZUOLUYBWJQVM', 1),
  ('VFNEO6KHA4VSWYFN2AXIY3IP', 1),
  ('DVIKFHUFPS2WRNM6D5U7FOS7', 1),
  ('XYX4BR3GBWO5F2QYEEGUIYDG', 1),
  ('WK5GP7D5IADJ3GPBQWABFBRW', 2),
  ('WXNV23NHSJMNAWLAEOFM2URH', 2);

INSERT INTO
  public.favorite_products (user_id, product_id)
VALUES
  (
    '641b5d66-ac2b-4b60-9f83-2941ce477fb3',
    'D5W4O2IT7Y35323GS34ZF6G6'
  ),
  (
    '641b5d66-ac2b-4b60-9f83-2941ce477fb3',
    '2WMCSYAZ6PIL5TVRZESYLZ6N'
  ),
  (
    '18eb4a3b-2bb3-4f3d-a9bb-1de3211916ec',
    '2WMCSYAZ6PIL5TVRZESYLZ6N'
  );