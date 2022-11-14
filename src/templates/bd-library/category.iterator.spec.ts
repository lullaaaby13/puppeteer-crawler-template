import { BrowserExtension } from '../../puppeteer/extension';
import { launch } from '../../puppeteer/puppeteer';
import { pageIterator } from './page.iterator';
import { categoryIterator, ROOT_URL } from './category.iterator';

describe('CategoryIterator', () => {

    let browser: BrowserExtension;

    afterEach(async () => {
        if (browser) await browser.close();
    });

    it('메인 / 순회', async () => {
        browser = await launch(ROOT_URL);
        const pageExtension = await browser.firstPage();
        await categoryIterator.build(pageExtension).iterate();
    }, 1000 * 300);

});