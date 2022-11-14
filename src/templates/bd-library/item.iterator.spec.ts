import { launch } from '../../puppeteer/puppeteer';
import { BrowserExtension } from '../../puppeteer/extension';
import { itemDetailProcess, itemIterator } from './item.iterator';

describe('ItemIterator', () => {

    let browser: BrowserExtension;

    afterEach(async () => {
        if (browser) await browser.close();
    });

    it('프로세스 / 책 상세 보기', async () => {
        browser = await launch('https://www.snlib.go.kr/bd/menu/10265/program/30004/plusSearchResultDetail.do?searchType=KDC&searchCategory=ALL&searchLibrary=&searchLibraryArr=MB&searchKdc=005&searchSort=SIMILAR&searchOrder=DESC&searchRecordCount=10&currentPageNo=2&viewStatus=IMAGE&recKey=1294888&bookKey=1294890&publishFormCode=BO');
        const pageExtension = await browser.firstPage();
        const result = await itemDetailProcess(pageExtension, []);
        expect(result.title).toEqual('데이터베이스 설계와 구축/');
    }, 1000 * 30);

    it('순회 / 아이템', async () => {
        browser = await launch('https://www.snlib.go.kr/bd/menu/10265/program/30004/plusSearchKdcResultList.do?searchType=KDC&searchCategory=ALL&searchLibrary=&searchLibraryArr=MB&searchKdc=005&searchSort=SIMILAR&searchOrder=DESC&searchRecordCount=10&currentPageNo=2&viewStatus=IMAGE&recKey=&bookKey=&publishFormCode=');
        const pageExtension = await browser.firstPage();
        await itemIterator.build(pageExtension).iterate();
    }, 1000 * 300);

});