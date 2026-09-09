import { addDays, daysSince, mondayOfWeek, toISODate } from '../lib/dates';
import { putLogEntry, putRecipe } from '../lib/db/db';
import type { LogEntry, MealSlot, Recipe } from './types';

export interface RecipeSeed extends Recipe {
  times: number;
  ago: number;
}

export const RECIPE_SEEDS: RecipeSeed[] = [
  {
    id: 'chicken',
    name: 'Sheet-pan chicken thighs',
    cuisine: 'Weeknight',
    minutes: 45,
    times: 22,
    ago: 5,
    rating: 5,
    ingredients: [
      '6 chicken thighs, bone-in',
      '2 lemons',
      'New potatoes',
      'Oregano, garlic, olive oil',
      'Castelvetrano olives',
    ],
    notes:
      "The one we fall back on. Crank to 220°C for the last ten minutes or the skin stays sad.",
  },
  {
    id: 'cacio',
    name: 'Cacio e pepe',
    cuisine: 'Pasta',
    minutes: 15,
    times: 18,
    ago: 1,
    rating: 5,
    ingredients: [
      'Tonnarelli or spaghetti',
      'Pecorino romano, grated fine',
      'Black pepper, cracked',
      'Pasta water',
    ],
    notes:
      "Take the pan off the heat before the cheese goes in. We've broken this sauce enough times to know.",
  },
  {
    id: 'shakshuka',
    name: 'Shakshuka',
    cuisine: 'Breakfast',
    minutes: 20,
    times: 14,
    ago: 5,
    rating: 5,
    ingredients: [
      'Tinned tomatoes',
      'Red pepper, onion',
      'Cumin, paprika, harissa',
      '4 eggs',
      'Feta and parsley',
    ],
    notes: 'Saturday default. Double the harissa, add the feta off the heat.',
  },
  {
    id: 'curry',
    name: 'Green curry',
    cuisine: 'Thai',
    minutes: 40,
    times: 11,
    ago: 2,
    rating: 4,
    ingredients: [
      'Green curry paste',
      'Coconut milk',
      'Thai aubergine, beans',
      'Fish sauce, palm sugar',
      'Thai basil',
    ],
    notes: "Fry the paste in the coconut cream until it splits — that's the whole trick.",
  },
  {
    id: 'salmon',
    name: 'Miso salmon & rice',
    cuisine: 'Japanese',
    minutes: 30,
    times: 9,
    ago: 4,
    rating: 4,
    ingredients: [
      'Salmon fillets',
      'White miso, mirin, sake',
      'Short-grain rice',
      'Cucumber, sesame',
    ],
    notes: 'Marinate at least an hour. Broil close to the element, watch it, it burns in a blink.',
  },
  {
    id: 'chana',
    name: 'Chana masala',
    cuisine: 'Indian',
    minutes: 35,
    times: 7,
    ago: 19,
    rating: 3,
    ingredients: [
      'Chickpeas',
      'Onion, ginger, garlic',
      'Tomatoes',
      'Garam masala, amchur',
      'Coriander',
    ],
    notes: 'Needs more acid than the recipe says. Squeeze of lime at the end.',
  },
  {
    id: 'pancakes',
    name: 'Buttermilk pancakes',
    cuisine: 'Breakfast',
    minutes: 25,
    times: 6,
    ago: 1,
    rating: 4,
    ingredients: ['Buttermilk', 'Flour, baking soda', '2 eggs, separated', 'Butter for the pan'],
    notes: 'Whip the whites. Non-negotiable, apparently.',
  },
  {
    id: 'squash',
    name: 'Roast squash salad',
    cuisine: 'Salad',
    minutes: 30,
    times: 4,
    ago: 52,
    rating: 3,
    ingredients: ['Delica squash', 'Farro', 'Pumpkin seeds', 'Sage brown butter', 'Ricotta salata'],
    notes: 'Better warm than cold. We keep forgetting we like this.',
  },
];

const HISTORY_CADENCE_DAYS = 9;

export const WEEK0_BY_OFFSET: Record<number, { recipeId: string; slot: MealSlot }[]> = {
  0: [{ recipeId: 'cacio', slot: 'Dinner' }],
  1: [
    { recipeId: 'shakshuka', slot: 'Breakfast' },
    { recipeId: 'chicken', slot: 'Dinner' },
  ],
  2: [{ recipeId: 'salmon', slot: 'Dinner' }],
  3: [],
  4: [{ recipeId: 'curry', slot: 'Dinner' }],
  5: [
    { recipeId: 'pancakes', slot: 'Breakfast' },
    { recipeId: 'cacio', slot: 'Dinner' },
  ],
  6: [],
};

export function buildRecipeHistory(seed: RecipeSeed, today: Date, createdAtStart: number): LogEntry[] {
  const entries: LogEntry[] = [];
  for (let i = 0; i < seed.times; i++) {
    const daysBack = seed.ago + i * HISTORY_CADENCE_DAYS;
    entries.push({
      id: crypto.randomUUID(),
      date: toISODate(addDays(today, -daysBack)),
      slot: 'Dinner',
      recipeId: seed.id,
      freeName: null,
      photoId: null,
      createdAt: createdAtStart + i,
    });
  }
  return entries;
}

export function buildWeek0(today: Date, createdAtStart: number): LogEntry[] {
  const monday = mondayOfWeek(today);
  const todayOffset = daysSince(toISODate(monday), today);
  const entries: LogEntry[] = [];
  let createdAt = createdAtStart;

  for (const [offsetKey, dayEntries] of Object.entries(WEEK0_BY_OFFSET)) {
    const offset = Number(offsetKey);
    if (offset > todayOffset) continue;
    const date = toISODate(addDays(monday, offset));
    for (const { recipeId, slot } of dayEntries) {
      entries.push({
        id: crypto.randomUUID(),
        date,
        slot,
        recipeId,
        freeName: null,
        photoId: null,
        createdAt: createdAt++,
      });
    }
  }

  return entries;
}

export async function seed(): Promise<{ recipes: Recipe[]; log: LogEntry[] }> {
  const today = new Date();
  const recipes: Recipe[] = RECIPE_SEEDS.map(({ times: _times, ago: _ago, ...recipe }) => recipe);

  let createdAt = 0;
  const log: LogEntry[] = [];
  for (const recipeSeed of RECIPE_SEEDS) {
    const history = buildRecipeHistory(recipeSeed, today, createdAt);
    createdAt += history.length;
    log.push(...history);
  }
  log.push(...buildWeek0(today, createdAt));

  await Promise.all([...recipes.map((recipe) => putRecipe(recipe)), ...log.map((entry) => putLogEntry(entry))]);

  return { recipes, log };
}
