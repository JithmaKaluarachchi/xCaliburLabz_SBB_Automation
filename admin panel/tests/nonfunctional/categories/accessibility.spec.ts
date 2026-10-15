import AxeBuilder from '@axe-core/playwright';
import { test, expect } from '../../../fixtures/categories.fixture';

test('CAT-NF-A11Y-001 categories has no critical automated WCAG violations @categories @nonfunctional @accessibility', async ({ page, categories }, testInfo) => {
  await categories.open();
  const results = await new AxeBuilder({ page }).include('main').withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
  await testInfo.attach('categories-axe.json', { body: JSON.stringify(results.violations, null, 2), contentType: 'application/json' });
  expect(results.violations.filter(v => v.impact === 'critical')).toEqual([]);
});
