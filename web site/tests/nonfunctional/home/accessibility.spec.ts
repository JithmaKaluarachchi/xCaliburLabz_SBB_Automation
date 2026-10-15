import AxeBuilder from '@axe-core/playwright';
import { test, expect } from '../../../fixtures/test.fixture';

test('@nonfunctional @accessibility automated WCAG scan reports no critical-impact violations (page availability is tested separately)', async ({ homePage, page }, testInfo) => {
  await homePage.open();
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();

  await testInfo.attach('axe-results', {
    body: JSON.stringify(results, null, 2),
    contentType: 'application/json'
  });
  const critical = results.violations.filter((violation) => violation.impact === 'critical');
  expect(critical, `Critical-impact WCAG findings: ${critical.map((violation) => `${violation.id}: ${violation.help}`).join('; ')}`).toEqual([]);
});
