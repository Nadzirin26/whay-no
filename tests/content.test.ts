import { expect, it } from 'vitest';
import { categories, quotes } from '../src/data/quotes';
it('menyediakan 60 kata original unik, sepuluh per kategori', () => {
  expect(quotes).toHaveLength(60);
  expect(new Set(quotes.map(q => q.text)).size).toBe(60);
  expect(new Set(quotes.map(q => q.id)).size).toBe(60);
  for (const category of categories) expect(quotes.filter(q => q.category === category)).toHaveLength(10);
});
