-- Migration 005: support custom admin sessions for media uploads.
-- Admin users are stored in admin_users, so uploaded_by cannot reference auth.users.

alter table media_assets
  drop constraint if exists media_assets_uploaded_by_fkey;
