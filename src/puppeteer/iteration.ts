import { PageTask, resolvePageTasks } from './page.task';
import { PageExtension } from './extension';
import delay from 'delay';
import { ElementHandle } from 'puppeteer';

export interface IterationResult2<T> {
    data?: T;
    error?: Error;
}

export class IterationResult<T> {

    private readonly values: T[] = [];

    constructor(values: T[]) {
        this.values.concat(values);
    }

    add(value: T) {
        this.values.push(value);
    }

    addAll(other: T[]): IterationResult<T> {
        return new IterationResult([this.values, other].flat());
    }

    mergeAll(others: IterationResult<T>[]): IterationResult<T> {
        if (others.length === 0) return;
        const merged = [];
        [this, ...others]
            .map(({ values }) => values)
            .forEach(it => merged.push(it));
        return new IterationResult(merged);
    }

    concat(other: IterationResult<T>): void {
        if (other) {
            this.values.concat(other.values);
        }
    }

    concatAll(others: IterationResult<T>[]): void {
        if (!others || others.length === 0) return;
        others
            .filter(it => it.values.length > 0)
            .map(({ values }) => values)
            .forEach(it => this.values.concat(it));
    }

    value(): T[] {
        return this.values;
    }
}

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

interface Iterator {
    iterate(): Promise<void>;
}

export interface IterationLifeCycle<T> {
    beforeAll?: PageTask<void>[];
    beforeEach?: PageTask<void>[];
    process: PageTask<T>;
    afterEach?: PageTask<void>[];
    afterAll?: PageTask<void>[];
}

export type IterationOptions<T> = IterationLifeCycle<T>

abstract class AbstractIterator<T> implements Iterator {

    protected readonly page: PageExtension;
    protected readonly options: IterationOptions<T>;

    constructor(page: PageExtension, options?: IterationOptions<T>) {
        this.page = page;
        this.options = options;
    }

    abstract iterate(): Promise<void>;
}

export class IndexedForIterator<T> extends AbstractIterator<T>{

    private readonly selector: string;

    constructor(page: PageExtension, selector: string, options?: IterationOptions<T>) {
        super(page, options);
        this.selector = selector;
    }

    async iterate(): Promise<void> {

        const results: IterationResult2<T>[] = [];

        const length = await this.page.$$(this.selector).then(elementHandles => elementHandles.length);

        // BEFORE ALL
        await resolvePageTasks<void>(this.options.beforeAll, this.page, []);

        for (let index = 0; index < length; index++) {
            const result: IterationResult2<T> = {};
            try {
                // BEFORE EACH
                await resolvePageTasks<void>(this.options.beforeEach, this.page, [index]);

                result.data = await this.options.process(this.page, [index]);

            } catch (error) {
                result.error = error;
            } finally {
                // AFTER EACH
                await resolvePageTasks<void>(this.options.afterEach, this.page, [index, result]);
            }
        }

        // AFTER ALL
        await resolvePageTasks<void>(this.options.afterAll, this.page, [results]);
    }

}

interface IPagePredicate {
    <T>(page: PageExtension, ...args: any[]): Promise<boolean>;
}
declare const pagePredicate: IPagePredicate;
export type PagePredicate = typeof pagePredicate

export class WhileTrueIterator<T> extends AbstractIterator<T>{

    predicate?: PagePredicate;

    constructor(page: PageExtension, selector: string, predicate: PagePredicate, options?: IterationOptions<T>) {
        super(page, options);
        this.predicate = predicate;
    }

    async iterate(): Promise<void> {

        const results: IterationResult2<T>[] = [];

        // BEFORE ALL
        await resolvePageTasks<void>(this.options.beforeAll, this.page, []);

        while(await this.predicate(this.page)) {

            const result: IterationResult2<T> = {};
            try {
                // BEFORE EACH
                await resolvePageTasks<void>(this.options.beforeEach, this.page, []);

                result.data = await this.options.process(this.page, []);

            } catch (error) {
                result.error = error;
            } finally {
                // AFTER EACH
                await resolvePageTasks<void>(this.options.afterEach, this.page, [result]);
            }

        }

        // AFTER ALL
        await resolvePageTasks<void>(this.options.afterAll, this.page, [results]);
    }

}

export class AsynchronousIterator<T> extends AbstractIterator<T>{

    private readonly selector: string;

    constructor(page: PageExtension, selector: string, options?: IterationOptions<T>) {
        super(page, options);
    }

    async iterate(): Promise<void> {

        // BEFORE ALL
        await resolvePageTasks<void>(this.options.beforeAll, this.page, []);

        const elementHandles: ElementHandle[] = await this.page.$$(this.selector);

        const resolvedAll = await Promise.allSettled(elementHandles.map(async it => {
            await resolvePageTasks<void>(this.options.beforeEach, this.page, [it]);
            // TODO
            const processResult = await this.options.process(this.page, []);
            await resolvePageTasks<void>(this.options.afterEach, this.page, [processResult]);
            return processResult;
        }));

        const results: IterationResult2<T>[] = resolvedAll.map(it => {
            if (it.status === 'fulfilled') {
                return { data: it.value[0] };
            }
            if (it.status === 'rejected') {
                return { error: it.reason };
            }
        });

        // AFTER ALL
        await resolvePageTasks<void>(this.options.afterAll, this.page, [results]);
    }
}


