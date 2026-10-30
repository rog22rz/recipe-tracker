-- Drop the recipes.rating column. The star rating feature was never wired up
-- to any UI that could set it, so every row's value was still the default 0.
alter table public.recipes drop column if exists rating;
