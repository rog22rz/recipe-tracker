import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { LogEntry, Recipe, Settings } from '../../store/types';

interface PhotoRow {
  id: string;
  blob: Blob;
  createdAt: number;
}

interface KitchenLogDB extends DBSchema {
  recipes: {
    key: string;
    value: Recipe;
  };
  log: {
    key: string;
    value: LogEntry;
    indexes: { date: string; recipeId: string };
  };
  photos: {
    key: string;
    value: PhotoRow;
  };
  settings: {
    key: string;
    value: Settings;
  };
}

const DB_NAME = 'kitchen-log';
const DB_VERSION = 1;
const SETTINGS_KEY = 'settings';

let dbPromise: Promise<IDBPDatabase<KitchenLogDB>> | undefined;

export function getDb(): Promise<IDBPDatabase<KitchenLogDB>> {
  if (!dbPromise) {
    dbPromise = openDB<KitchenLogDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        db.createObjectStore('recipes', { keyPath: 'id' });
        const log = db.createObjectStore('log', { keyPath: 'id' });
        log.createIndex('date', 'date');
        log.createIndex('recipeId', 'recipeId');
        db.createObjectStore('photos', { keyPath: 'id' });
        db.createObjectStore('settings');
      },
    }).catch((error: unknown) => {
      dbPromise = undefined;
      throw error;
    });
  }
  return dbPromise;
}

export async function getAllRecipes(): Promise<Recipe[]> {
  const db = await getDb();
  return db.getAll('recipes');
}

export async function putRecipe(recipe: Recipe): Promise<void> {
  const db = await getDb();
  await db.put('recipes', recipe);
}

export async function getAllLogEntries(): Promise<LogEntry[]> {
  const db = await getDb();
  return db.getAll('log');
}

export async function putLogEntry(entry: LogEntry): Promise<void> {
  const db = await getDb();
  await db.put('log', entry);
}

export async function getSettings(): Promise<Settings | undefined> {
  const db = await getDb();
  return db.get('settings', SETTINGS_KEY);
}

export async function putSettings(settings: Settings): Promise<void> {
  const db = await getDb();
  await db.put('settings', settings, SETTINGS_KEY);
}
