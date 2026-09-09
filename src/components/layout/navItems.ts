export interface NavItem {
  to: string;
  glyph: string;
  label: string;
  end: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { to: '/', glyph: '▤', label: 'Week', end: true },
  { to: '/recipes', glyph: '◉', label: 'Recipes', end: false },
  { to: '/rotation', glyph: '▮', label: 'Rotation', end: true },
];
