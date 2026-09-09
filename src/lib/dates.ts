function ymd(d: Date): [number, number, number] {
  return [d.getFullYear(), d.getMonth(), d.getDate()];
}

function fromYmd(year: number, month: number, day: number): Date {
  return new Date(year, month, day);
}

export function toISODate(d: Date): string {
  const [year, month, day] = ymd(d);
  return new Date(Date.UTC(year, month, day)).toISOString().slice(0, 10);
}

export function addDays(d: Date, n: number): Date {
  const [year, month, day] = ymd(d);
  const utc = new Date(Date.UTC(year, month, day + n));
  return fromYmd(utc.getUTCFullYear(), utc.getUTCMonth(), utc.getUTCDate());
}

export function mondayOfWeek(d: Date): Date {
  const [year, month, day] = ymd(d);
  const base = fromYmd(year, month, day);
  const dow = base.getDay();
  const diff = dow === 0 ? -6 : 1 - dow;
  return addDays(base, diff);
}

export function daysSince(isoDate: string, today: Date): number {
  const [isoYear, isoMonth, isoDay] = isoDate.split('-').map(Number);
  const past = Date.UTC(isoYear, isoMonth - 1, isoDay);
  const [year, month, day] = ymd(today);
  const now = Date.UTC(year, month, day);
  return Math.round((now - past) / 86_400_000);
}
