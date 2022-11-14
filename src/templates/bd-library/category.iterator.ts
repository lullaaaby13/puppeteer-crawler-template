import { IndexedForIteratorBuilder } from '../../puppeteer/iteration';
import {
    CHAINING_ITERATOR,
    CONSOLE_NEW_LINE,
    NAVIGATE_BY_URL,
    NAVIGATE_INDEXED_CLICK,
    WAIT_UNTIL_VISIBLE
} from '../../puppeteer/iteration/page-task';
import { pageIterator } from './page.iterator';

export const ROOT_URL = 'https://www.snlib.go.kr/bd/menu/10265/program/30004/plusSearchKdc.do';

export const $CATEGORY = 'div.kdcSearch > ol > li > dl > dd > a';

const options = {
    beforeEach: [
        CONSOLE_NEW_LINE,
        WAIT_UNTIL_VISIBLE($CATEGORY),
        NAVIGATE_INDEXED_CLICK($CATEGORY)
    ], // args[0]: index

    process: CHAINING_ITERATOR(pageIterator),

    afterEach: [NAVIGATE_BY_URL(ROOT_URL)], // args[0]: index, args[1]: T

    afterAll: [
        async (page) => console.log('모든 카테고리 수집 완료.'),
    ], // args[0]: T[]
};

export const categoryIterator = new IndexedForIteratorBuilder($CATEGORY, options);