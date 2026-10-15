import AxeBuilder from '@axe-core/playwright';
import { test, expect } from '../../../fixtures/login.fixture';

test('LOGIN-NF-A11Y-001 automated scan finds no critical-impact WCAG violations @nonfunctional @accessibility', async ({ page, loginPage }, testInfo) => {
  await loginPage.open();
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
  const critical = results.violations.filter((item) => item.impact === 'critical');
  await testInfo.attach('axe-summary.json', { body: JSON.stringify({ violations: results.violations }, null, 2), contentType: 'application/json' });
  expect(critical, 'Automated accessibility scan; this does not prove total WCAG compliance').toEqual([]);
});
