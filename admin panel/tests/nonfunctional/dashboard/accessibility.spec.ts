import AxeBuilder from '@axe-core/playwright';
import { test, expect } from '../../../fixtures/dashboard.fixture';

test('DASH-NF-A11Y-001 dashboard has no critical automated WCAG violations @dashboard @nonfunctional @accessibility', async ({ page, dashboard }, testInfo) => {
  await dashboard.open();
  const results = await new AxeBuilder({ page }).include('main').withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
  await testInfo.attach('dashboard-axe.json', { body: JSON.stringify(results.violations, null, 2), contentType: 'application/json' });
  expect(results.violations.filter(v => v.impact === 'critical')).toEqual([]);
});
