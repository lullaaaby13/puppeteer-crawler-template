import { PagePool, Task } from './page-pool';
import { BrowserExtension } from './browser-extension';
import { launch } from './puppeteer';
import { PageExtension } from './page-extension';
import { sleep } from '../utils/common.utils';

describe('PagePool', () => {

    it('PoolSize = 2로 설정 했을 때, 3개의 작업을 제출 하면 1개의 작업은 대기 중 이다.', async () => {
        const browser: BrowserExtension = await launch('https://www.google.co.kr');
        const page: PageExtension = new PageExtension(await browser.firstPage());
        const pagePool = new PagePool(browser.value, 2);
        await pagePool.initialize();
        const task: Task<void> = {
            url: 'https://www.naver.com',
            async process(page: PageExtension): Promise<void> {
                console.log(new Date().toISOString());
                console.log('네이버 페이지 이동!!');
                await sleep(10);
            },
            async onFinish<T>(result: T): Promise<void> {
                console.log('onFinish');
            },
        };
        pagePool.submit(task);

        const task1: Task<void> = {
            url: 'https://daum.net',
            async process(page: PageExtension): Promise<void> {
                console.log(new Date().toISOString());
                console.log('네이버 페이지 이동!!');
                await sleep(10);
            },
            async onFinish<T>(result: T): Promise<void> {
                console.log('onFinish');
            },
        };
        pagePool.submit(task1);

        const task2: Task<void> = {
            url: 'https://www.nate.com',
            async process(page: PageExtension): Promise<void> {
                console.log(new Date().toISOString());
                console.log('네이버 페이지 이동!!');
                await sleep(10);
            },
            async onFinish<T>(result: T): Promise<void> {
                console.log('onFinish');
            },
        };
        pagePool.submit(task2);

        await sleep(10);

    }, 1000 * 60);

});