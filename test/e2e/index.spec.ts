import { describe, it, expect } from './server.folio';

describe('index page', () => {
  it('has a link to /emojicon', async ({ page, port }) => {
    await page.goto(`http://localhost:${port}`);
    const href = await page.getAttribute('"/emojicon"', 'href');

    expect(href).toBe('/emojicon/');
  });
});
