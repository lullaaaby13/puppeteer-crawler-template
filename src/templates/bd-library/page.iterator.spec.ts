import { BrowserExtension } from '../../puppeteer/extension';
import { launch } from '../../puppeteer/puppeteer';
import { pageIterator } from './page.iterator';

describe('PageIterator', () => {

    let browser: BrowserExtension;

    afterEach(async () => {
        if (browser) await browser.close();
    });
    
    it('순회 / 페이지', async () => {
        browser = await launch('https://www.snlib.go.kr/bd/menu/10265/program/30004/plusSearchKdcResultList.do?searchType=KDC&searchCategory=ALL&searchLibrary=&searchLibraryArr=MB&searchKdc=041&searchSort=SIMILAR&searchOrder=DESC&searchRecordCount=10&currentPageNo=1&viewStatus=IMAGE&recKey=&bookKey=&publishFormCode=');
        const pageExtension = await browser.firstPage();
        await pageIterator.build(pageExtension).iterate();
    }, 1000 * 300);
});