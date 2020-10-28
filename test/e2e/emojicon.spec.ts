import { describe, it, expect } from './server.folio';

describe('emojicon page', () => {
  it('has title', async ({ page, port }) => {
    await page.goto(`http://localhost:${port}/emojicon`);

    expect(await page.textContent('h1')).toBe('Emojicon');
  });

  it('generates image of clicked emoji', async ({ page, port }) => {
    await page.goto(`http://localhost:${port}/emojicon`);
    await page.click('.examples a:first-child');

    expect(await page.$('canvas')).not.toBeNull();
    expect(await page.textContent('#data-url')).toContain(
      'data:image/jpg;base64,'
    );
  });

  it('generates image of input emoji', async ({ page, port }) => {
    await page.goto(`http://localhost:${port}/emojicon`);
    await page.fill('#emoji', '🚀');

    expect(await page.$('canvas')).not.toBeNull();
    expect(await page.textContent('#data-url')).toContain(
      'data:image/png;base64,'
    );
  });
});
