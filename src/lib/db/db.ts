import { supabase } from '../supabase/client';
import type { LogEntry, Recipe, Settings } from '../../store/types';

export interface PhotoRow {
  id: string;
  blob: Blob;
  createdAt: number;
}

export async function getAllRecipes(): Promise<Recipe[]> {
  const { data, error } = await supabase
    .from('recipes')
    .select('id, name, cuisine, minutes, rating, ingredients, notes');
  if (error) throw error;
  return data ?? [];
}

export async function putRecipe(recipe: Recipe): Promise<void> {
  const { error } = await supabase.from('recipes').upsert({
    id: recipe.id,
    name: recipe.name,
    cuisine: recipe.cuisine,
    minutes: recipe.minutes,
    rating: recipe.rating,
    ingredients: recipe.ingredients,
    notes: recipe.notes,
  });
  if (error) throw error;
}

interface LogEntryRow {
  id: string;
  date: string;
  slot: LogEntry['slot'];
  recipe_id: string | null;
  free_name: string | null;
  photo_id: string | null;
  created_at: string;
}

function toLogEntry(row: LogEntryRow): LogEntry {
  return {
    id: row.id,
    date: row.date,
    slot: row.slot,
    recipeId: row.recipe_id,
    freeName: row.free_name,
    photoId: row.photo_id,
    createdAt: new Date(row.created_at).getTime(),
  };
}

export async function getAllLogEntries(): Promise<LogEntry[]> {
  const { data, error } = await supabase
    .from('log_entries')
    .select('id, date, slot, recipe_id, free_name, photo_id, created_at');
  if (error) throw error;
  return (data ?? []).map(toLogEntry);
}

export async function putLogEntry(entry: LogEntry): Promise<void> {
  const { error } = await supabase.from('log_entries').upsert({
    id: entry.id,
    date: entry.date,
    slot: entry.slot,
    recipe_id: entry.recipeId,
    free_name: entry.freeName,
    photo_id: entry.photoId,
    created_at: new Date(entry.createdAt).toISOString(),
  });
  if (error) throw error;
}

export async function getSettings(): Promise<Settings | undefined> {
  const { data, error } = await supabase
    .from('settings')
    .select('stale_after_days, show_meal_slots, default_sort, layout_override')
    .maybeSingle();
  if (error) throw error;
  if (!data) return undefined;
  return {
    staleAfterDays: data.stale_after_days,
    showMealSlots: data.show_meal_slots,
    defaultSort: data.default_sort,
    layoutOverride: data.layout_override,
  };
}

export async function putSettings(settings: Settings): Promise<void> {
  const { error } = await supabase.from('settings').upsert(
    {
      stale_after_days: settings.staleAfterDays,
      show_meal_slots: settings.showMealSlots,
      default_sort: settings.defaultSort,
      layout_override: settings.layoutOverride,
    },
    { onConflict: 'owner_id' },
  );
  if (error) throw error;
}

async function getOwnerId(): Promise<string> {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) throw error ?? new Error('Not authenticated');
  return data.user.id;
}

export async function getPhoto(id: string): Promise<PhotoRow | undefined> {
  const ownerId = await getOwnerId();
  const { data: row, error } = await supabase
    .from('photos')
    .select('id, created_at')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  if (!row) return undefined;

  const { data: blob, error: downloadError } = await supabase.storage
    .from('photos')
    .download(`${ownerId}/${id}`);
  if (downloadError) throw downloadError;

  return { id: row.id, blob, createdAt: new Date(row.created_at).getTime() };
}

export async function putPhoto(photo: PhotoRow): Promise<void> {
  const ownerId = await getOwnerId();
  const { error: uploadError } = await supabase.storage
    .from('photos')
    .upload(`${ownerId}/${photo.id}`, photo.blob, { upsert: true });
  if (uploadError) throw uploadError;

  const { error } = await supabase.from('photos').upsert({
    id: photo.id,
    created_at: new Date(photo.createdAt).toISOString(),
  });
  if (error) throw error;
}
