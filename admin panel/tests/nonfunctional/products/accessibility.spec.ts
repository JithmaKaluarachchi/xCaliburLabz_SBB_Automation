import AxeBuilder from '@axe-core/playwright';
import { test, expect } from '../../../fixtures/products.fixture';

test('PROD-NF-A11Y-001 products has no critical automated WCAG violations @products @nonfunctional @accessibility', async ({ page, products }, testInfo) => {
  await products.open();
  const results = await new AxeBuilder({ page }).include('main').withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
  await testInfo.attach('products-axe.json', { body: JSON.stringify(results.violations, null, 2), contentType: 'application/json' });
  expect(results.violations.filter(v => v.impact === 'critical')).toEqual([]);
});
