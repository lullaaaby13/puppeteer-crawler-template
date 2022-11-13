import { HTTPResponse } from 'puppeteer';

export class ResponseCache {

    protected resolved = false;

    protected headers: Record<string, string>;
    protected url: string;

    constructor(response: HTTPResponse, resolved?: boolean) {
        this.headers = response.headers();
        this.url = response.url();
        if (response !== undefined) {
            this.resolved = resolved;
        } else {
            this.resolved = true;
        }
    }

    public isResolved() {
        return this.isResolved();
    }

}

export class ImageResponseCache extends ResponseCache {
    url: string;
    data: Buffer;

    constructor(response: HTTPResponse) {
        super(response, false);
        Promise.all([
            response.buffer()
                .then(data => this.data = data)

        ]).then(() => this.resolved = true);
    }


}