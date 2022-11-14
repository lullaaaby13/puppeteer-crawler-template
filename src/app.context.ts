import { Injectable } from '@nestjs/common';
import { launch } from './puppeteer/puppeteer';
import { BrowserExtension } from './puppeteer/extension';
import { categoryIterator, ROOT_URL } from './templates/bd-library/category.iterator';

@Injectable()
export class AppContext {

    async start() {
        const browser: BrowserExtension = await launch(ROOT_URL);
        await categoryIterator.build(await browser.firstPage()).iterate();
    }
}


