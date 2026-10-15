import { test, expect } from '../../fixtures/test.fixture';
import { getUniqueInternalLinks } from '../../utils/links';

test('@functional @api visible internal links do not return server errors', async ({ homePage, page, request }) => {
  await homePage.open();
  const links = (await getUniqueInternalLinks(page)).slice(0, 25);
  expect(links.length, 'Expected the home page to contain internal links').toBeGreaterThan(0);

  const failures: string[] = [];
  for (const link of links) {
    const response = await request.get(link, { failOnStatusCode: false });
    if (response.status() >= 500) failures.push(`${response.status()} ${link}`);
  }
  expect(failures, 'Internal links returning 5xx').toEqual([]);
});
