import { describe, expect, it } from 'vitest';
import { groupIngredients } from './groupIngredients';

describe('groupIngredients', () => {
  it('returns an empty array for no ingredients', () => {
    expect(groupIngredients([])).toEqual([]);
  });

  it('puts everything in one untitled section when there are no headers', () => {
    expect(groupIngredients(['Pasta', 'Pecorino', 'Black pepper'])).toEqual([
      { title: null, items: ['Pasta', 'Pecorino', 'Black pepper'] },
    ]);
  });

  it('keeps items before the first header in an untitled leading section', () => {
    expect(groupIngredients(['Salt', '# For the sauce', 'Soy sauce'])).toEqual([
      { title: null, items: ['Salt'] },
      { title: 'For the sauce', items: ['Soy sauce'] },
    ]);
  });

  it('splits into multiple titled sections', () => {
    expect(
      groupIngredients(['# For the sauce', 'Soy sauce', 'Sugar', '# For the filling', 'Beef', 'Garlic']),
    ).toEqual([
      { title: 'For the sauce', items: ['Soy sauce', 'Sugar'] },
      { title: 'For the filling', items: ['Beef', 'Garlic'] },
    ]);
  });

  it('handles consecutive headers with no items between them', () => {
    expect(groupIngredients(['# Sauce', '# Filling', 'Beef'])).toEqual([
      { title: 'Sauce', items: [] },
      { title: 'Filling', items: ['Beef'] },
    ]);
  });

  it('strips leading #s and whitespace in various forms', () => {
    expect(groupIngredients(['#Sauce'])).toEqual([{ title: 'Sauce', items: [] }]);
    expect(groupIngredients(['##  Sauce'])).toEqual([{ title: 'Sauce', items: [] }]);
    expect(groupIngredients(['#   Sauce  '])).toEqual([{ title: 'Sauce', items: [] }]);
  });
});
