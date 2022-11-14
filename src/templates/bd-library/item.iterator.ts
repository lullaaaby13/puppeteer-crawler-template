import { IndexedForIteratorBuilder } from '../../puppeteer/iteration';
import {
    CONSOLE_NEW_LINE,
    NAVIGATE_INDEXED_CLICK,
    NAVIGATION_GO_BACK,
    WAIT_UNTIL_VISIBLE
} from '../../puppeteer/iteration/page-task';

export const itemDetailProcess = async (onBookDetailPage, args) => {
    console.log(`[BookDetail]: [index = ${args}] 제목 = ${await onBookDetailPage.textContent('.resultViewDetail h4')}`);
    return { title: await onBookDetailPage.textContent('.resultViewDetail h4') };
};

export const $BOOK_LINK = '.bookDataWrap dt.tit a';

const options = {
    beforeEach: [
        CONSOLE_NEW_LINE,
        WAIT_UNTIL_VISIBLE($BOOK_LINK),
        NAVIGATE_INDEXED_CLICK($BOOK_LINK)
    ],
    process: itemDetailProcess,
    afterEach: [
        NAVIGATION_GO_BACK
    ],
};

export const itemIterator = new IndexedForIteratorBuilder($BOOK_LINK, options);