# Puppeteer Crawler Template

## 케이스

- 인스타그램
  - 특정 유저의 팔로워
- 유튜브
  - 검색 결과 수집
  - 특정 영상의 댓글 수집
- 쇼핑몰
  - 공개 페이지
    - 네이버 쇼핑
    - 쿠팡
    - 마켓 컬리 등등 
  - 비공개 페이지
    - 주문 목록 수집
      - 수집 속도에 크게 제한 받지 않는다. -> 동시에 여러 건 처리 가능
- 기타 사이트
  - 검색 결과 수집

## 요구 사항

1. 수집 대상이 페이징 처리 되어 있을 때, 다음 파라미터로 수집 동작하도록 로직을 구현한다.
   1. 페이지 selector
   2. 상세 보기 selector
   3. 단건 처리 / 다건 처리 선택 가능
2. 이미지 파일을 쉽게 저장할 수 있어야 한다.
   findOneImage(url: String)
   findAllImage(url: String)
   1. 기본 TTL 30초
   2. 명시적 expire
   3. page객체 사라질때 expire
   

3. 엑셀 파일 생성
   1. 


3. 파일 처리를 위한 유틸(고민)

## TODO
1. 엑셀 라이브러리 찾아 보기

## 고민
- 오류에 대한 처리
  - 수집 도중 오류가 발생 했을 경우,
    1. 종료
       1. 사용자에게 알림
       2. 개발자에게 알림
    2. 무시 하고 진행
       1. 사용자에게 알림
