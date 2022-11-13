import delay from 'delay';
import { PageExtension } from './extension';

interface IPageTask {
    <T>(page: PageExtension, args: any[]): Promise<T>;
}
declare const pageTask: IPageTask;
export type PageTask<T> = typeof pageTask<T>

export const NAVIGATION_GO_BACK: PageTask<void> = async (page: PageExtension): Promise<void> => {
    await page.goBack();
    await delay(500);
};

export const PAGE_CLOSE: PageTask<void> = async (page: PageExtension): Promise<void> => {
    await page.close();
};

export async function resolvePageTasks<T>(pageTasks: PageTask<T>[], page: PageExtension, args: any[]) {
    if (!pageTasks) return;
    for (let index = 0; index < pageTasks.length; index++) {
        await pageTasks[index](page, args);
    }
}