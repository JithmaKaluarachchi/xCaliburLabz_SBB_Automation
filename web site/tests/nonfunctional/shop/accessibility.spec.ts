import AxeBuilder from '@axe-core/playwright';
import { test, expect } from '../../../fixtures/test.fixture';

for (const path of ['/shop', '/cart', '/checkout']) {
  test(`@shop @nonfunctional @accessibility ${path} automated WCAG scan reports no critical-impact violations (page availability is tested separately)`, async ({ page }, testInfo) => {
    await page.goto(path, { waitUntil: 'domcontentloaded' });
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
    await testInfo.attach('axe-results', { body: JSON.stringify(results, null, 2), contentType: 'application/json' });
    const critical = results.violations.filter(v => v.impact === 'critical');
    expect(critical, `Critical-impact WCAG findings: ${critical.map(v => `${v.id}: ${v.help}`).join('; ')}`).toEqual([]);
  });
}
