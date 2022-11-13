import { PageTask } from './page.task';
import { PageExtension } from './extension';

export class Collect<T> {

    private readonly page: PageExtension;
    private readonly collect: PageTask<T>;
    private readonly after: PageTask<void>;

    constructor(page: PageExtension, collect: PageTask<T>, after: PageTask<void>) {
        this.page = page;
        this.collect = collect;
        this.after = after;
    }

    async execute(): Promise<T> {
        return this.collect(this.page, [])
            .then(result => {
                this.after(this.page, [result]);
                return result;
            });
    }

}

const collect: <T>(page: PageExtension, collect: PageTask<T>, after: PageTask<void>) => Promise<T>
    = <T>(page, collect, after) => collect(page)
        .then(result => {
            after(page);
            return result;
        });