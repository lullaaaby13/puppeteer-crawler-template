import { Browser, executablePath } from 'puppeteer';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import puppeteer from 'puppeteer-extra';
import { BrowserExtension } from './extension';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const puppeteerExtraPluginUserAgentOverride = require('puppeteer-extra-plugin-stealth/evasions/user-agent-override');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const stealth = require('puppeteer-extra-plugin-stealth');
const stealthPlugin = stealth();

stealthPlugin.enabledEvasions.delete('user-agent-override');
const pluginUserAgentOverride = puppeteerExtraPluginUserAgentOverride({
    userAgent:
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.5112.87 Whale/3.16.138.22 Safari/537.36',
});
puppeteer.use(stealthPlugin);
puppeteer.use(pluginUserAgentOverride);


export async function launch(initUrl?: string): Promise<BrowserExtension> {
    const browser: Browser = await puppeteer.launch({
        args: ['--no-sandbox', '--start-maximized'],
        headless: false,
        executablePath: executablePath(),
    });

    if (initUrl) {
        const page = await browser.newPage();
        await Promise.all([
            page.goto(initUrl),
            browser.pages().then(pages => pages[0].close())
        ]);
    }

    return new BrowserExtension(browser);
}
