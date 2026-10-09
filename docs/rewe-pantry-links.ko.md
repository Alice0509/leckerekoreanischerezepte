# REWE 기본 재료 제휴 링크 4개

2026-10-09: 운영자가 Awin에서 발급받아 제공한 REWE DE(광고주 11652 / 게시자 3113363) 링크를 등록한다. 기존 Type 550 밀가루 링크는 유지한다.

| 재료 slug   | 상품 예시                                | 상품 번호 |
| ----------- | ---------------------------------------- | --------- |
| sugar       | ja! Raffinade-Zucker · 1 kg              | 5249473   |
| cooking-oil | ja! Reines Rapsöl · 1 l                  | 6801447   |
| apfelessig  | REWE Beste Wahl Apfelessig klar · 1 l    | 8331440   |
| paniermehl  | REWE Beste Wahl Panko Paniermehl · 140 g | 2666357   |

## 적용 범위

설탕·식용유·사과식초는 기존 CMS 설명이 비어 있어 상세 페이지가 생성되지 않았다. 이번 변경은 네 재료의 영어·독일어 기본 가이드를 코드에서 제공하고 상세 페이지·레시피 링크를 활성화한다. 기존 CMS 설명이나 사진은 덮어쓰지 않는다. 이 네 재료를 새로 검색 색인 허용 목록에 추가하지 않는다.

- 독일어 해당 재료 페이지의 구매 안내.
- 실제 재료 목록에 해당 slug가 있는 독일어 레시피의 접힌 구매 안내.
- 독일어 `/gallery`의 승인된 상품 목록: 기존 밀가루와 이번 4개.
- 영어 페이지에는 해당 지역에서 찾을 일반적인 재료 검색어와 슈퍼마켓 안내만 제공한다. 독일 REWE 링크나 Awin 링크를 표시하지 않는다.
- 사진과 같은 브랜드라고 단정하거나 직접 사용한 제품이라고 소개하지 않는다. 기존 개인 사용 메모와 구분된 구매 예시다.

흰 설탕은 갈색 설탕·슈가파우더와 구분한다. 중립 식용유는 참기름·올리브유 대신 자동 추천하지 않는다. 사과식초는 식초 에센스·발사믹과 구분한다. 판코는 일반 고운 빵가루보다 거친 구매 선택지이며, 돈가스의 겉옷과 함박스테이크의 결착 용도를 구분해 안내한다. REWE 가격·재고·배송은 구매자의 위치에 따라 확인해야 한다.

## 검토 및 배포

이미 `AFFILIATE_LINKS_ENABLED=true`를 Vercel Preview와 Production에 저장했다면 다시 설정하지 않는다. 이번 PR의 새 배포가 값을 사용한다.

1. PR 미리보기 주소에서 `/de/ingredients/sugar`, `/de/ingredients/cooking-oil`, `/de/ingredients/apfelessig`, `/de/ingredients/paniermehl`을 연다.
2. 정확한 상품명과 `Werbung · Affiliate-Link`, 수수료 안내를 확인한다. 모바일 버튼과 제품 팁은 기존 컴팩트 디자인을 사용한다.
3. `/de/recipes/bibim-noodle-sauce`, `/de/recipes/einfaches-japanisches-golden-curry`, `/de/recipes/tonkatsu-korean-style`에서 ‘Zutaten für dieses Rezept finden’을 열어 실제 재료와 상품이 맞는지 확인한다.
4. `/de/gallery`에서 이번 네 상품과 기존 밀가루가 표시되는지 확인한다.
5. 영어 페이지에서 REWE 상품이 표시되지 않는지 확인한 뒤 merge한다.

Sanity Studio 배포나 Publish는 필요 없다. 레시피·분량·기존 사진·CMS 문서는 수정하지 않는다. 이번 코드 변경은 새 배포부터 반영된다.

## 측정과 되돌리기

기존 GA4 구매처 클릭 탐색에서 `이벤트 이름 = click`을 유지하고 도메인 정규식에 `awin1.com`이 포함되어 있으면 추가 설정이 필요 없다. 분석 쿠키에 동의한 방문의 클릭만 현 방식으로 수집한다. 클릭은 주문이나 확정 수수료가 아니다. Awin에서 REWE 주문과 승인된 수수료를 별도로 확인한다.

문제가 생기면 `AFFILIATE_LINKS_ENABLED=false`로 저장하고 다시 배포한다. 구매 예시는 남고 Awin 주소는 일반 REWE 상품 주소로 돌아간다. 승인 상품 묶음은 표시되지 않는다.

## 공식 상품 페이지

- https://www.rewe.de/shop/p/ja-raffinade-zucker-1kg/5249473
- https://www.rewe.de/shop/p/ja-reines-rapsoel-1l/6801447
- https://www.rewe.de/shop/p/rewe-beste-wahl-apfelessig-klar-1l/8331440
- https://www.rewe.de/shop/p/rewe-beste-wahl-panko-paniermehl-140g/2666357

정확한 제휴 주소는 `lib/affiliate-links.json`, 상품명·종류 안내는 `lib/ingredientShoppingProducts.json`에서 한 번 관리한다. 같은 상품을 사용하는 모든 페이지는 이 목록을 공유한다.

## 한국 빵가루와 REWE 앱 도움말 보완

운영자의 재료 사진은 한국 빵가루다. REWE 판코는 같은 상품이 아닌 대체 구매 선택지다. 재료 페이지·레시피의 구매 안내·gallery에 `Alternative zum koreanischen Paniermehl`을 표시한다. 한국 빵가루의 CMS 정보·사진·레시피 분량은 유지한다.

REWE 앱이 상품을 열지 못하면 구매 버튼 아래의 `Probleme mit der REWE-App?`을 펼친다. 상품 웹주소를 복사해 Safari 등 브라우저의 주소창에 직접 붙여 넣거나, 상품명을 복사해 REWE 앱에서 검색할 수 있다. 도움말은 기본적으로 접혀 있다. 복사가 차단되면 실제 주소를 입력란에서 직접 선택할 수 있다. 이 주소는 일반 상품 주소이며 제휴 링크가 아니다. 기본 구매 버튼의 Awin 발급 링크·광고 표시는 유지한다.

이 보완은 REWE 앱의 상품 화면 처리나 주문 추적을 수리하는 기능이 아니다. 앱으로 넘어간 구매의 제휴 인정 여부는 REWE가 앱 추적을 지원하는지 확인해야 한다. Apple 공식 문서는 브라우저 주소창에 직접 입력한 URL이 Universal Link로 앱을 열지 않는다고 설명한다. 쇼핑몰 자체의 이후 동작·재고·매장별 상품은 별도다.

검증: 기존 검사와 복사 성공/거부/미지원, 일반 주소와 제휴 주소 구분, 독일어·REWE 상품에만 노출하는 검사, 접힌 도움말 서버 렌더링을 포함해 테스트 50개. 전체 빌드 및 생성 HTML에서 판코 대체 표시와 REWE 도움말·직접 주소를 확인한다. 실제 iPhone REWE 앱 동작과 앱 주문 수수료 인정은 확인하지 못했다.

공식 문서:

- https://developer.apple.com/documentation/technotes/tn3155-debugging-universal-links
- https://help.awin.com/docs/de/app-tracking-guide
