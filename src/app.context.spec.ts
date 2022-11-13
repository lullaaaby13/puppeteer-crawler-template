import { stringify, parse } from 'querystring';

describe('AppContext', () => {

    it('PlayGround', () => {
        const url = 'https://www.snlib.go.kr/bd/menu/10265/program/30004/plusSearchKdcResultList.do?searchType=KDC&searchCategory=ALL&searchLibrary=&searchLibraryArr=MB&searchKdc=001&searchSort=SIMILAR&searchOrder=DESC&searchRecordCount=10&currentPageNo=2&viewStatus=IMAGE&recKey=&bookKey=&publishFormCode=';
        // console.log(stringify({ name: 'Apple', color: 'Red' }));
        console.log(parse(url));
    });

});