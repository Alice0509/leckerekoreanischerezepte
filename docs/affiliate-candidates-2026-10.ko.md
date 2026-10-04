# 제휴 후보: 2026-10-04 확인

현재 작은 사이트에 맞춰 먼저 관련 식재료를 취급하는 후보 2–3곳에 집중한다. 각 프로그램의 승인 조건은 신청 화면에서 다시 확인한다. 네트워크 가입은 개별 광고주 승인을 뜻하지 않는다.

| 우선순위 | 후보 | 시장 | 확인한 사실 | 다음 행동 |
| --- | --- | --- | --- | --- |
| 1 | Asiafoodland | 독일 | [Awin 광고주 15939](https://ui.awin.com/merchant-profile/15939) 공개 프로그램 | Awin에서 사이트를 설명하고 신청. 고추장·참기름 상품 주소로 deep link 허용 여부 확인 |
| 2 | Weee! | 미국 독자 | [공식 affiliate 프로그램](https://www.weee.com/company/affiliates-en) | 독일 거주 publisher의 가입·지급 조건을 먼저 확인하고 신청 |
| 3 | REWE | 독일 | [공식 Partnerprogramm](https://www.rewe.de/partnerprogramm/), [Awin 광고주 11652](https://ui.awin.com/merchant-profile/11652) | 슈퍼마켓 기본 재료와 연결. 지점·배송별 상품 차이를 확인 |
| 보류 | Handokmall | 독일 | 일반 상품 주소와 [공식 연락처](https://handokmall.de/de/impressum/) 확인. 공개 affiliate 프로그램은 확인하지 못함 | 독자가 실제로 쓸 구매 안내는 유지. 필요하면 직접 제휴 유무 문의 |
| 보류 | momogo | 독일 | 일반 상품 주소 확인. 공개 publisher 가입 프로그램은 확인하지 못함 | 고객 포인트 제도와 affiliate를 혼동하지 말고 별도로 확인 |

Weee!는 미국 구매 옵션이며 영어 사이트 전체를 미국 전용으로 바꾸지 않는다. Weee!가 Awin 광고주라는 근거는 확보하지 못했으므로 Awin과 별개인 공식 가입 경로를 안내한다. 홈페이지의 수익 홍보 문구를 Hansik Young의 예상 수익으로 사용하지 않는다.

## 먼저 연결할 다섯 가지 재료

| 재료 | 연결할 레시피 | 구매 설명의 핵심 |
| --- | --- | --- |
| 고추장 | 초고추장·비빔 소스·떡볶이 | 원래 페이스트와 이미 양념된 sauce 구분 |
| 고춧가루 | 비빔 소스·김치·매운 국 | 굵기·맵기·향신료 혼합 여부 |
| 참기름 | 비빔 소스·비빔밥·나물 | roasted/toasted, 혼합유 여부 |
| 진간장 | 비빔 소스·불고기 | Jin S/Jin Gold 제품군과 국간장 구분 |
| Golden Curry | 일본 카레 | roux blocks, 220 g 포장과 실제 110 g 사용 |

실제 사용하는 재료라는 정보와 특정 판매점의 특정 포장을 직접 사용했다는 정보는 구분한다. 브랜드별 개인 경험을 추가하려면 본인이 쓴 제품인지 확인한다. 밀가루 Type 550은 REWE 제휴의 보조 후보로 이미 정확한 상품 주소가 있다.

승인 후에는 발급받은 **정확한 상품의 tracking URL**을 기존 `lib/affiliate-links.json`에 넣고 확인한 광고주·언어·승인 값을 기록한다. 승인된 링크만 광고 표기와 함께 기존 기능으로 활성화한다. 이번 PR은 제휴 추적을 활성화하지 않는다.

## 신청에 사용할 소개

English:

Hansik Young is my Korean home-cooking website, with recipes and ingredient guides in English and German. I focus on practical meals, clear cooking steps and choosing ingredients outside Korea. Product links appear where they help readers find an ingredient used in a recipe. My English website is https://www.hansikyoung.com and my German website is https://www.leckere-koreanische-rezepte.de.

Deutsch:

Hansik Young ist meine Website für koreanische Hausmannskost mit Rezepten und Zutaten-Guides auf Deutsch und Englisch. Ich zeige praktische Alltagsgerichte, verständliche Kochschritte und die Auswahl passender Zutaten außerhalb Koreas. Produktlinks ergänzen die Zutaten-Guides und helfen beim Einkauf für ein konkretes Rezept. Die deutschsprachige Website ist https://www.leckere-koreanische-rezepte.de.

## 측정

Pinterest outbound clicks → 해당 레시피 방문 → 구매 링크 클릭 → 제휴 대시보드의 확정 수수료를 각각 본다. GA4는 분석 동의한 방문자만 기록되는 현재 구조를 기준으로 해석한다. 전체 클릭 수나 검색 방문을 GA4 사용자 수와 같다고 보지 않는다. GA4 설정은 기존 `docs/purchase-click-measurement.ko.md`를 사용한다.
