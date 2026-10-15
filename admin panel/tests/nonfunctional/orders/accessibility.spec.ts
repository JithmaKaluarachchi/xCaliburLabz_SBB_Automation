import AxeBuilder from '@axe-core/playwright';
import { test, expect } from '../../../fixtures/orders.fixture';

test('ORDER-NF-A11Y-001 list and details have no critical automated WCAG violations @orders @nonfunctional @accessibility', async ({ page, orders }, testInfo) => {
  await orders.open();
  const list = await new AxeBuilder({ page }).include('main').withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
  await orders.openFirstDetails();
  const details = await new AxeBuilder({ page }).include('main').withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
  const critical = [...list.violations, ...details.violations].filter(v => v.impact === 'critical');
  await testInfo.attach('orders-accessibility.json', { body: JSON.stringify({ list: list.violations, details: details.violations }, null, 2), contentType: 'application/json' });
  const summary = critical.map(v => `${v.id}: ${v.nodes.length} affected element(s)`).join('; ');
  expect(critical.length, `Critical accessibility violations: ${summary}`).toBe(0);
});
