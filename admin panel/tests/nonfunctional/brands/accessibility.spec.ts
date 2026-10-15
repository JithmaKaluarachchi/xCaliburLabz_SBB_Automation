import AxeBuilder from '@axe-core/playwright';
import { test, expect } from '../../../fixtures/brands.fixture';

test('BRAND-NF-A11Y-001 brands has no critical automated WCAG violations @brands @nonfunctional @accessibility', async ({ page, brands }, testInfo) => {
  await brands.open();
  const results = await new AxeBuilder({ page }).include('main').withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
  await testInfo.attach('brands-axe.json', { body: JSON.stringify(results.violations, null, 2), contentType: 'application/json' });
  expect(results.violations.filter(v => v.impact === 'critical')).toEqual([]);
});
