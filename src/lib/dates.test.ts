import { describe, expect, it } from 'vitest';
import { addDays, daysSince, formatWeekRange, mondayOfWeek, toISODate } from './dates';

describe('toISODate', () => {
  it('formats a date as YYYY-MM-DD', () => {
    expect(toISODate(new Date(2026, 8, 9))).toBe('2026-09-09');
  });
});

describe('addDays', () => {
  it('adds days, rolling over month boundaries', () => {
    const result = addDays(new Date(2026, 7, 31), 1);
    expect(toISODate(result)).toBe('2026-09-01');
  });
});

describe('mondayOfWeek', () => {
  it('returns the same date when given a Monday', () => {
    expect(toISODate(mondayOfWeek(new Date(2026, 8, 7)))).toBe('2026-09-07');
  });

  it('returns the prior Monday for a mid-week date', () => {
    expect(toISODate(mondayOfWeek(new Date(2026, 8, 9)))).toBe('2026-09-07');
  });

  it('treats Sunday as the end of the week, not the start', () => {
    expect(toISODate(mondayOfWeek(new Date(2026, 8, 13)))).toBe('2026-09-07');
  });
});

describe('daysSince', () => {
  it('computes whole days between an ISO date and today', () => {
    expect(daysSince('2026-09-01', new Date(2026, 8, 9))).toBe(8);
  });
});

describe('formatWeekRange', () => {
  it('formats a week within a single month', () => {
    expect(formatWeekRange(new Date(2026, 8, 7))).toBe('Sep 7 — 13, 2026');
  });

  it('formats a week that spans two months', () => {
    expect(formatWeekRange(new Date(2026, 7, 31))).toBe('Aug 31 — Sep 6, 2026');
  });

  it('formats a week that spans two years', () => {
    expect(formatWeekRange(new Date(2026, 11, 28))).toBe('Dec 28, 2026 — Jan 3, 2027');
  });
});
