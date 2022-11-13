import { IterationResult } from './puppeteer/iteration';

export interface Book {
    title: string;
    writer: string;
    publisher: string;
}

export class Books extends IterationResult<Book> {}