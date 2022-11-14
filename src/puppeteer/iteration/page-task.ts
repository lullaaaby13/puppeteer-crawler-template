import delay from 'delay';
import { PageExtension } from '../extension';
import { IteratorBuilder } from './index';

interface IPageTask {
    <T>(page: PageExtension, args: any[]): Promise<T>;
}
declare const pageTask: IPageTask;
export type PageTask<T> = typeof pageTask<T>

export async function resolvePageTasks<T>(pageTasks: PageTask<T>[], page: PageExtension, args: any[]) {
    if (!pageTasks) return;
    for (let index = 0; index < pageTasks.length; index++) {
        await pageTasks[index](page, args);
    }
}

export const CHAINING_ITERATOR: (iteratorBuilder: IteratorBuilder<any>) => PageTask<void> = (iteratorBuilder: IteratorBuilder<any>) => async (page: PageExtension): Promise<void> => {
    await iteratorBuilder.build(page).iterate();
};

export const NAVIGATION_GO_BACK: PageTask<void> = async (page: PageExtension): Promise<void> => {
    await page.goBack();
    await delay(500);
};

export const PAGE_CLOSE: PageTask<void> = async (page: PageExtension): Promise<void> => {
    await page.close();
};

export const WAIT_UNTIL_VISIBLE: (selector: string) => PageTask<void> = (selector: string) => async (page: PageExtension): Promise<void> => {
    await page.waitUntilVisible(selector);
};

export const NAVIGATE_BY_URL: (url: string) => PageTask<void> = (url: string) => async (page: PageExtension): Promise<void> => {
    await page.navigate(url);
};

export const NAVIGATE_INDEXED_CLICK: (selector: string) => PageTask<void> = (selector: string) => async (page: PageExtension, ...args: any[]): Promise<void> => {
    await page.$$navigatorClick(selector, args[0]);
};

export const CONSOLE_NEW_LINE: PageTask<void> = async (page: PageExtension, ...args: any[]): Promise<void> => {
    console.log('');
};

export const SLEEP_SECOND_OF: (value: number) => PageTask<void> = (value: number) => async (page: PageExtension): Promise<void> => {
    await delay(1000 * value);
};

export const SLEEP_MILLI_OF: (value: number) => PageTask<void> = (value: number) => async (page: PageExtension): Promise<void> => {
    await delay(value);
};