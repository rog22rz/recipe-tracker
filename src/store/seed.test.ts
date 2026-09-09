import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it } from 'vitest';
import { addDays, daysSince, mondayOfWeek, toISODate } from '../lib/dates';
import { daysSinceCooked, lastCookedAt, timesCooked } from './selectors';
import { buildRecipeHistory, buildWeek0, RECIPE_SEEDS, seed, WEEK0_BY_OFFSET } from './seed';

describe('buildRecipeHistory (synthetic history generation, in isolation)', () => {
  const today = new Date(2026, 8, 13);

  it.each(RECIPE_SEEDS)(
    'produces exactly $times entries for $id, most recent $ago days ago',
    (recipeSeed) => {
      const history = buildRecipeHistory(recipeSeed, today, 0);
      expect(history).toHaveLength(recipeSeed.times);
      expect(timesCooked(history, recipeSeed.id)).toBe(recipeSeed.times);
      expect(daysSinceCooked(history, recipeSeed.id, today)).toBe(recipeSeed.ago);
    },
  );
});

describe('buildWeek0 (clamped to today, in isolation)', () => {
  it('on a Wednesday, only emits Mon/Tue/Wed entries, nothing past today', () => {
    const wednesday = new Date(2026, 8, 9);
    const entries = buildWeek0(wednesday, 0);
    const dates = entries.map((e) => e.date);
    const wednesdayIso = toISODate(wednesday);

    expect(dates.every((date) => date <= wednesdayIso)).toBe(true);
    expect(entries.some((e) => e.recipeId === 'salmon')).toBe(true);
    expect(entries.some((e) => e.recipeId === 'curry')).toBe(false);
    expect(entries.some((e) => e.recipeId === 'pancakes')).toBe(false);
  });

  it('on a Monday, only emits that single day', () => {
    const monday = mondayOfWeek(new Date(2026, 8, 9));
    const entries = buildWeek0(monday, 0);

    expect(entries).toHaveLength(1);
    expect(entries[0].recipeId).toBe('cacio');
    expect(entries[0].date).toBe(toISODate(monday));
  });

  it('on a Sunday, emits the full week, including Saturday', () => {
    const sunday = addDays(mondayOfWeek(new Date(2026, 8, 9)), 6);
    const entries = buildWeek0(sunday, 0);
    const saturdayIso = toISODate(addDays(mondayOfWeek(sunday), 5));

    const cacioDinnerDates = entries
      .filter((e) => e.recipeId === 'cacio' && e.slot === 'Dinner')
      .map((e) => e.date);
    expect(cacioDinnerDates).toContain(saturdayIso);
  });
});

function todayOffsetOf(today: Date): number {
  return daysSince(toISODate(mondayOfWeek(today)), today);
}

function weekOccurrencesFor(recipeId: string, todayOffset: number): number[] {
  return Object.entries(WEEK0_BY_OFFSET)
    .filter(([offset, entries]) => Number(offset) <= todayOffset && entries.some((entry) => entry.recipeId === recipeId))
    .map(([offset]) => Number(offset));
}

describe('seed (full log: synthetic history + WEEK0 layered on top)', () => {
  let result: Awaited<ReturnType<typeof seed>>;

  beforeEach(async () => {
    result = await seed();
  });

  it('produces exactly 8 recipes with no times/ago fields', () => {
    expect(result.recipes).toHaveLength(8);
    for (const recipe of result.recipes) {
      expect(recipe).not.toHaveProperty('times');
      expect(recipe).not.toHaveProperty('ago');
    }
  });

  it('never contains a log entry dated after today', () => {
    const todayIso = toISODate(new Date());
    expect(result.log.every((entry) => entry.date <= todayIso)).toBe(true);
  });

  it.each(RECIPE_SEEDS)(
    'timesCooked for $id is the synthetic count plus its clamped WEEK0 occurrences',
    (recipeSeed) => {
      const todayOffset = todayOffsetOf(new Date());
      const weekCount = weekOccurrencesFor(recipeSeed.id, todayOffset).length;
      expect(timesCooked(result.log, recipeSeed.id)).toBe(recipeSeed.times + weekCount);
    },
  );

  it('never-in-WEEK0 recipes (chana, squash) keep lastCookedAt matching the prototype ago', () => {
    const today = new Date();
    expect(daysSinceCooked(result.log, 'chana', today)).toBe(19);
    expect(daysSinceCooked(result.log, 'squash', today)).toBe(52);
  });

  it('WEEK0-touched recipes have a lastCookedAt no older than their synthetic history alone', () => {
    const today = new Date();
    const todayOffset = todayOffsetOf(today);
    for (const recipeSeed of RECIPE_SEEDS) {
      const weekCount = weekOccurrencesFor(recipeSeed.id, todayOffset).length;
      if (weekCount === 0) continue;
      const combinedLast = lastCookedAt(result.log, recipeSeed.id);
      expect(combinedLast).not.toBeNull();
      expect(daysSinceCooked(result.log, recipeSeed.id, today)).toBeLessThanOrEqual(recipeSeed.ago);
    }
  });

  it('layers a cacio dinner onto Monday of the current week', () => {
    const mondayIso = toISODate(mondayOfWeek(new Date()));
    const cacioDinnerDates = result.log
      .filter((entry) => entry.recipeId === 'cacio' && entry.slot === 'Dinner')
      .map((entry) => entry.date);
    expect(cacioDinnerDates).toContain(mondayIso);
  });
});
