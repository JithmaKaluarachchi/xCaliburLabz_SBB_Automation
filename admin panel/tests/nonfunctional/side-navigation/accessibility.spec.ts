import AxeBuilder from '@axe-core/playwright';
import { test, expect } from '../../../fixtures/side-navigation.fixture';

test('SIDENAV-NF-A11Y-001 sidebar has no critical-impact automated WCAG violations @side-navigation @nonfunctional @accessibility', async ({ page, sideNavigation }, testInfo) => {
  await sideNavigation.authenticate(); await sideNavigation.ensureOpen();
  const results = await new AxeBuilder({ page }).include('aside').withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa']).analyze();
  await testInfo.attach('sidebar-axe.json', { body: JSON.stringify(results.violations, null, 2), contentType: 'application/json' });
  expect(results.violations.filter(v => v.impact === 'critical')).toEqual([]);
});
