create table if not exists public.recipes (
  id text primary key,
  owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null,
  cuisine text not null,
  minutes integer not null,
  rating integer not null,
  ingredients text[] not null default '{}',
  notes text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists public.photos (
  id text primary key,
  owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.log_entries (
  id text primary key,
  owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  date date not null,
  slot text not null check (slot in ('Breakfast', 'Lunch', 'Dinner')),
  recipe_id text references public.recipes(id) on delete set null,
  free_name text,
  photo_id text references public.photos(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.settings (
  owner_id uuid primary key default auth.uid() references auth.users(id) on delete cascade,
  stale_after_days integer not null default 14,
  show_meal_slots boolean not null default true,
  default_sort text not null default 'recent',
  layout_override text not null default 'auto'
);

alter table public.recipes enable row level security;
alter table public.photos enable row level security;
alter table public.log_entries enable row level security;
alter table public.settings enable row level security;

create policy "owner_full_access" on public.recipes
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
create policy "owner_full_access" on public.photos
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
create policy "owner_full_access" on public.log_entries
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
create policy "owner_full_access" on public.settings
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

insert into storage.buckets (id, name, public)
values ('photos', 'photos', false)
on conflict (id) do nothing;

create policy "owner_read_own_photos" on storage.objects
  for select using (bucket_id = 'photos' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "owner_write_own_photos" on storage.objects
  for insert with check (bucket_id = 'photos' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "owner_update_own_photos" on storage.objects
  for update using (bucket_id = 'photos' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "owner_delete_own_photos" on storage.objects
  for delete using (bucket_id = 'photos' and (storage.foldername(name))[1] = auth.uid()::text);
