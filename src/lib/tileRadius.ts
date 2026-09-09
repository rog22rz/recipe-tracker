export function tileRadius(size: number): string {
  return size > 56 ? 'var(--radius-tile-max)' : 'var(--radius-tile-min)';
}
