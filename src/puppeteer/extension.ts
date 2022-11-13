import { Browser, ElementHandle, Page, PageEventObject } from 'puppeteer';
import { CacheStore } from '@nestjs/common';
import { parse } from 'querystring';

export class BrowserExtension {

    public readonly value: Browser;

    constructor(Browser: Browser) {
        this.value = Browser;
    }

    pageOf(index: number) {
        return this.value.pages().then(pages => pages[index]);
    }

    firstPage(): Promise<PageExtension> {
        return this.pageOf(0)
            .then(page => new PageExtension(page));
    }

    lastPage() {
        return this.value.pages().then(pages => pages[pages.length - 1]);
    }

    async openPages(count = 1): Promise<Page[]> {
        const pages = [];
        for (let index = 0; index < count; index++) {
            pages.push(await this.value.newPage());
        }
        return pages;
    }


}


export class PageExtension {

    public readonly page: Page;
    private eventCounter = 0;

    constructor(page: Page) {
        this.page = page;

        //this.page.on('framenavigated', arg => console.log('framenavigated'));


        // this.addEventListener('domcontentloaded');
        // this.addEventListener('frameattached');
        // this.addEventListener('framedetached');
        // this.addEventListener('framenavigated');
        // this.addEventListener('load');

        /**
         * 저장 대상 선택
         * url
         * file type
         */
    }

    private addEventListener(eventName: keyof PageEventObject) {
        this.page.on(eventName, arg => {
            console.log(`${this.eventCounter++}: ${eventName}`);
        });
    }

    async navigatorClick(source: string | ElementHandle) {
        await Promise.all([
            this.waitForNavigation(),
            this.click(source),
        ]);
    }

    async click(source: string | ElementHandle) {
        if (typeof source === 'string') {
            await this.page.evaluate(selector => {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                document.querySelector(selector).click();
            }, source);
        } else {
            await this.page.evaluate(element => {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                element.click();
            }, source);
        }
    }

    async navigate(url: string) {
        await Promise.all([
            this.page.waitForNavigation(),
            this.page.goto(url)
        ]);
    }

    async goBack() {
        await Promise.all([
            this.page.waitForNavigation(),
            this.page.goBack()
        ]);
    }

    async waitForNavigation() {
        try {
            await this.page.waitForNavigation().then(() => console.log('waitForNavigation resolved.'));
        } catch (error) {
            if (error.message === 'Execution context was destroyed, most likely because of a navigation.') {
                await this.reload();
            }
        }
    }

    private async reload() {
        await Promise.all([
            this.page.waitForNavigation().then(() => console.log('waitForNavigation resolved.')),
            this.page.reload(),
        ]);
    }

    $$(selector: string) {
        return this.page.$$(selector);
    }

    $$length(selector: string) {
        return this.$$(selector).then(elements => elements.length);
    }

    $(selector: string) {
        return this.page.$(selector);
    }

    $value(selector: string) {
        return this.page.$eval(selector, element => {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            return element.value;
        });
    }

    innerHTML(selector: string): Promise<string> {
        return this.page.$eval(selector, element => element.innerHTML);
    }

    outerHTML(selector: string): Promise<string> {
        return this.page.$eval(selector, element => element.outerHTML);
    }
    textContent(selector: string): Promise<string> {
        return this.page.$eval(selector, element => element.textContent);
    }

    url() {
        return this.page.url();
    }

    querystring(): any {
        return parse(this.page.url().substring(this.page.url().indexOf('?')));
    }

    async $$click(selector: string, index: number) {
        await this.page.$$eval(selector, (elements, i) => {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            elements[i].click();
        }, index);
    }

    async $$navigatorClick(selector: string, index: number) {
        await Promise.all([
            this.page.waitForNavigation(),
            this.page.$$eval(selector, (elements, i) => {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                elements[i].click();
            }, index)
        ]);
    }

    async waitUntilVisible(selector: string) {
        await this.page.waitForSelector(selector, { visible: true });
    }

    async close() {
        return this.page.close();
    }
}
