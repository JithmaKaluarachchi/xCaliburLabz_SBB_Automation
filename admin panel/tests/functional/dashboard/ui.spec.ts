import { dashboardMetrics, trendRanges } from '../../../pages/dashboard.page';
import { test, expect } from '../../../fixtures/dashboard.fixture';

test.describe('Admin dashboard - UI @dashboard @ui @functional', () => {
  test.beforeEach(async ({ dashboard }) => dashboard.open());

  test('DASH-UI-001 key dashboard content is visible without clipping', async ({ dashboard }) => {
    for (const label of dashboardMetrics) {
      const card = dashboard.metric(label);
      await expect(card).toBeVisible();
      expect(await card.evaluate(e => e.scrollWidth > e.clientWidth + 1), `${label} card is clipped`).toBeFalsy();
    }
  });

  test('DASH-UI-002 trend controls have usable click targets', async ({ dashboard }) => {
    for (const range of trendRanges) {
      const box = await dashboard.range(range).boundingBox();
      expect(box).not.toBeNull();
      expect(Math.round(box!.height), `${range} target height`).toBeGreaterThanOrEqual(24);
    }
  });

  test('DASH-UI-003 trend controls support keyboard focus', async ({ dashboard }) => {
    await dashboard.range('7d').focus();
    await expect(dashboard.range('7d')).toBeFocused();
    await dashboard.page.keyboard.press('Tab');
    await expect(dashboard.range('21d')).toBeFocused();
  });
});
