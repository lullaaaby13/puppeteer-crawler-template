import { Injectable } from '@nestjs/common';
import { launch } from './puppeteer/puppeteer';

import { NAVIGATION_GO_BACK, PageTask } from './puppeteer/page.task';
import { BrowserExtension, PageExtension } from './puppeteer/extension';
import {
    CONSOLE_NEW_LINE,
    IndexedForIterator,
    NAVIGATE_BY_URL,
    NAVIGATE_INDEXED_CLICK,
    SLEEP_SECOND_OF,
    WAIT_UNTIL_VISIBLE,
    WhileTrueIterator
} from './puppeteer/iteration';
import { stringify } from 'querystring';


const ROOT_URL = 'https://www.snlib.go.kr/bd/menu/10265/program/30004/plusSearchKdc.do';

const $CATEGORY = 'div.kdcSearch > ol > li > dl > dd > a';
const $BOOK_LINK = '.bookDataWrap dt.tit a';
const $PAGE = 'p.paging';


@Injectable()
export class AppContext {

    async start() {

        const browser: BrowserExtension = await launch(ROOT_URL);

        const bookListProcess: PageTask<void> = async (pageInBookList: PageExtension): Promise<void> => {
            // 현재 위치 -> 카테고리 내의 각각 페이지
            const bookListIterator = new IndexedForIterator(pageInBookList, $BOOK_LINK,
                {
                    beforeEach: [CONSOLE_NEW_LINE, WAIT_UNTIL_VISIBLE($BOOK_LINK), NAVIGATE_INDEXED_CLICK($BOOK_LINK)],
                    process: async (onBookDetailPage, args) => {
                        // 현재 위치 -> 책 상세 보기 페이지
                        console.log(`[BookDetail]: [index = ${args}] 제목 = ${await onBookDetailPage.textContent('.resultViewDetail h4')}`);
                        return { title: await onBookDetailPage.textContent('.resultViewDetail h4') };
                    },
                    afterEach: [NAVIGATION_GO_BACK],
                }
            );

            await bookListIterator.iterate();
            // 현재 위치 -> 카테고리 내의 각각 페이지
            // 모든 책 상세 순회 완료
        };


        const categoryProcess: PageTask<void> = async (pageInCategory: PageExtension): Promise<void> => {
            // 현재 위치: 카테고리의 1페이지

            const categoryIterator = new WhileTrueIterator(pageInCategory, $PAGE,
                async (page) => (await page.$$length($BOOK_LINK)) !== 0,
                {
                    beforeAll: [
                        async (page) => {
                            console.log(`[CategoryListIteration]: 카테고리에 대한 수집 시작 / 카테고리 = ${await page.textContent('strong.searchKwd.themeColor')}`);
                        },
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

                    process: bookListProcess,

                    // 페이지 처리 후,
                    afterEach: [
                        async (page) => {
                            const currentPage = await page.$value('input[name="currentPageNo"]');
                            console.log(`[CategoryListIteration]: ${currentPage} 페이지 수집 완료 / 다음 페이지 이동`);
                        },

                        async (page) => {
                            const url = await this.nextPageURL(page);
                            await page.navigate(url);
                        },

                    ], // args[0]: index, args[1]: T

                    // 처리 모두 끝나면
                    afterAll: [
                        async (page) => {
                            console.log(`[CategoryListIteration]: 카테고리에 대한 수집 완료 /  카테고리 = ${await page.textContent('strong.searchKwd.themeColor')}`);
                        }
                    ], // args[0]: T[]
                }
            );

            await categoryIterator.iterate();

            // 현재 위치: 카테고리의 마지막 페이지
        };

        // 클릭하면 카테고리 별 책 목록 페이지
        const rootIterator = new IndexedForIterator(await browser.firstPage(), $CATEGORY,
            {
                beforeEach: [
                    CONSOLE_NEW_LINE,
                    WAIT_UNTIL_VISIBLE($CATEGORY),
                    NAVIGATE_INDEXED_CLICK($CATEGORY)
                ], // args[0]: index

                process: categoryProcess, // args[0]: index

                afterEach: [ NAVIGATE_BY_URL(ROOT_URL) ], // args[0]: index, args[1]: T

                afterAll: [
                    async (page) => console.log('모든 카테고리 수집 완료.'),
                ], // args[0]: T[]
            });

        // 순회 시작
        await rootIterator.iterate();
    }

    private async nextPageURL(page: PageExtension) {
        const query: BookListQuery2 = {
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
}


class BookListQuery {
    searchType = 'KDC';
    searchCategory = 'ALL';
    searchLibrary = '';
    searchLibraryArr = '';
    searchKdc: number; // 카테고리
    searchSort = 'SIMILAR';
    searchOrder = 'DESC';
    searchRecordCount = 20; // 페이지 사이즈
    currentPageNo: number; // 페이지
    viewStatus: 'IMAGE'; // 조회 결과 종류(이미지, 등등)
    recKey = '';
    bookKey = '';
    publishFormCode = '';

    constructor(currentPageNo: number) {
        this.currentPageNo = currentPageNo;
    }

}

interface BookListQuery2 {
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
