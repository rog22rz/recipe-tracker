export interface IngredientSection {
  title: string | null;
  items: string[];
}

export function groupIngredients(ingredients: string[]): IngredientSection[] {
  const sections: IngredientSection[] = [];
  let current: IngredientSection | null = null;

  for (const line of ingredients) {
    if (line.startsWith('#')) {
      if (current) sections.push(current);
      current = { title: line.replace(/^#+\s*/, '').trim(), items: [] };
    } else {
      if (!current) current = { title: null, items: [] };
      current.items.push(line);
    }
  }
  if (current) sections.push(current);

  return sections;
}
