import { WhileTrueIteratorBuilder } from '../../puppeteer/iteration';
import { $BOOK_LINK, itemIterator } from './item.iterator';
import { CHAINING_ITERATOR, SLEEP_SECOND_OF } from '../../puppeteer/iteration/page-task';
import { PageExtension } from '../../puppeteer/extension';
import { stringify } from 'querystring';

export async function nextPageURL(page: PageExtension) {
    const query: BookListQuery = {
        bookKey: await page.$value('input[name="bookKey"]'),
        currentPageNo: await page.$value('input[name="currentPageNo"]'),
        publishFormCode: await page.$value('input[name="publishFormCode"]'),
        recKey: await page.$value('input[name="recKey"]'),
        searchCategory: await page.$value('input[name="searchCategory"]'),
        searchKdc: await page.$value('input[name="searchKdc"]'),
        searchLibrary: await page.$value('input[name="searchLibrary"]'),
        searchLibraryArr: await page.$value('input[name="searchLibraryArr"]'),
        searchOrder: await page.$value('input[name="searchOrder"]'),
        searchRecordCount: await page.$value('input[name="searchRecordCount"]'),
        searchSort: await page.$value('input[name="searchSort"]'),
        searchType: await page.$value('input[name="searchType"]'),
        viewStatus: await page.$value('input[name="viewStatus"]'),
    };
    query.currentPageNo = Number(query.currentPageNo) + 1;
    const nextPageURL = `https://www.snlib.go.kr/bd/menu/10265/program/30004/plusSearchKdcResultList.do?${stringify(query as any)}`;
    console.log(`nextPageURL = ${nextPageURL}`);
    return nextPageURL;
}

interface BookListQuery {
    searchType: string;
    searchCategory: string;
    searchLibrary: string;
    searchLibraryArr: string;
    searchKdc: string;
    searchSort: string;
    searchOrder: string;
    searchRecordCount: number;
    currentPageNo: number;
    viewStatus: string;
    recKey: string;
    bookKey: string;
    publishFormCode: string;
}


export const $PAGE = 'p.paging';

const options = {
    beforeAll: [
        async (page) => console.log(`[CategoryListIteration]: 카테고리에 대한 수집 시작 / 카테고리 = ${await page.textContent('strong.searchKwd.themeColor')}`),
        SLEEP_SECOND_OF(1),
    ],

    // 각각 처리 전
    beforeEach: [
        //WAIT_UNTIL_VISIBLE($PAGE),
        async (page) => {
            const currentPage = await page.$value('input[name="currentPageNo"]');
            console.log(`[CategoryListIteration]: ${currentPage} 페이지 수집 시작`);
        },
    ],

    process: CHAINING_ITERATOR(itemIterator),

    // 페이지 처리 후,
    afterEach: [
        async (page) => {
            const currentPage = await page.$value('input[name="currentPageNo"]');
            console.log(`[CategoryListIteration]: ${currentPage} 페이지 수집 완료 / 다음 페이지 이동`);
        },

        async (page) => {
            const url = await nextPageURL(page);
            await page.navigate(url);
        },

    ], // args[0]: index, args[1]: T

    afterAll: [
        async (page) => console.log(`[CategoryListIteration]: 카테고리에 대한 수집 완료 /  카테고리 = ${await page.textContent('strong.searchKwd.themeColor')}`)
    ],
};

export const pageIterator = new WhileTrueIteratorBuilder($PAGE, async (page) => (await page.$$length($BOOK_LINK)) !== 0, options);