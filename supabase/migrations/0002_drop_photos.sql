-- Drop the photos table, its storage bucket, and the log_entries.photo_id column.
-- Note: hosted Supabase blocks direct DML on storage.objects/storage.buckets via SQL
-- ("Direct deletion from storage tables is not allowed. Use the Storage API instead.").
-- The 'photos' bucket was confirmed empty and was already deleted via the Storage
-- Management API (DELETE /storage/v1/bucket/photos with the service_role key) before
-- this migration ran, so only the RLS policies that referenced it remain to clean up.
drop policy if exists "owner_read_own_photos" on storage.objects;
drop policy if exists "owner_write_own_photos" on storage.objects;
drop policy if exists "owner_update_own_photos" on storage.objects;
drop policy if exists "owner_delete_own_photos" on storage.objects;

alter table public.log_entries drop column if exists photo_id;

drop policy if exists "owner_full_access" on public.photos;
drop table if exists public.photos;
