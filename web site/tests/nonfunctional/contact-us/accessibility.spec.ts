import AxeBuilder from '@axe-core/playwright';
import { test, expect } from '../../../fixtures/test.fixture';

test('@contact-us @nonfunctional @accessibility automated WCAG scan reports no critical-impact violations (page availability is tested separately)', async ({ page }, testInfo) => {
  await page.goto('/contact', { waitUntil: 'domcontentloaded' });
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
  await testInfo.attach('axe-results', { body: JSON.stringify(results, null, 2), contentType: 'application/json' });
  const violations = results.violations.filter(v => v.impact === 'critical');
  expect(violations, `Critical-impact WCAG findings: ${violations.map(v => `${v.id}: ${v.help}`).join('; ')}`).toEqual([]);
});
