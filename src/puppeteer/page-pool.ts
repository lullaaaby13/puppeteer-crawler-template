
import { Browser } from 'puppeteer';
import delay from 'delay';
import { PageExtension } from './extension';

export class PagePool {

    private readonly browser: Browser;
    private readonly poolSize: number;

    private waiting: PageExtension[] = [];
    private initialized = false;

    constructor(browser: Browser, poolSize = 10) {
        this.browser = browser;
        this.poolSize = poolSize;
    }

    public async initialize() {
        for (let i = 0; i < this.poolSize; i++) {
            await this.browser.newPage()
                .then(page => new PageExtension(page))
                .then(pageExtension => this.waiting.push(pageExtension));
        }
        this.initialized = true;
    }

    public async submit<T>(task: Task<T>): Promise<void> {

        if (!this.initialized) {
            throw new Error('PagePool Not Initialized.');
        }

        let page: PageExtension = null;
        while(!page) {
            page = this.waiting.pop();
            await delay(100);
        }

        try {
            await page.navigate(task.url);
            const result = await task.process(page);
            await task.onFinish(result);
        } catch (error) {
            if (task.onError) {
                await task.onError(error);
            } else  {
                throw new error;
            }
        }

        this.waiting.push(page);
    }

}

export interface Task<T> {
    url: string;
    process: (page: PageExtension) => Promise<T>;
    onFinish: (result: T) => Promise<void>;
    onError?: (error: Error) => Promise<void>;
}
