import { PageTask, resolvePageTasks } from './page-task';
import { PageExtension } from '../extension';
import { ElementHandle } from 'puppeteer';
import { IterationResult2 } from './model';


export interface Iterator {
    iterate(): Promise<void>;
}

export interface IteratorBuilder<T> {
    readonly options?: IterationOptions<T>;
    build(page: PageExtension): Iterator;
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

class My<T> implements IteratorBuilder<T> {
    options: IterationOptions<T>;

    build(page: PageExtension): Iterator {
        return undefined;
    }

}

export class IndexedForIteratorBuilder<T> implements IteratorBuilder<T>{
    readonly selector: string;
    readonly options?: IterationOptions<T>;

    constructor(selector: string, options?: IterationOptions<T>) {
        this.selector = selector;
        this.options = options;
    }

    build(page: PageExtension): Iterator {
        return new IndexedForIterator(page, this.selector, this.options);
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

export class WhileTrueIteratorBuilder<T> implements IteratorBuilder<T> {
    readonly selector: string;
    readonly predicate: PagePredicate;
    readonly options?: IterationOptions<T>;

    constructor(selector: string, predicate: PagePredicate, options?: IterationOptions<T>) {
        this.selector = selector;
        this.predicate = predicate;
        this.options = options;
    }

    build(page: PageExtension): Iterator {
        return new IndexedForIterator(page, this.selector, this.options);
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


