# 독일·미국 구매처 안내와 다음 수익화 단계

## 이번 변경

재료 설명에서 제품 상세 페이지로 바로 이동할 수 있도록 구매처 안내를 표시합니다. 상품 이름·포장 크기와 다른 브랜드 또는 다른 형태에 대한 설명을 링크 위에 표시합니다.

| 재료                | 독일 페이지                                       | 영어 페이지                                         |
| ------------------- | ------------------------------------------------- | --------------------------------------------------- |
| Weizenmehl Type 550 | REWE Beste Wahl Type 550 1kg                      | 현지 구매처 안내, 나라별 밀가루 이름 차이 설명      |
| 팥앙금              | momogo: Imuraya Yude Azuki 200g                   | Weee!: Shirakiku Tsubuan 500g, 다른 브랜드임을 표시 |
| Golden Curry        | momogo: S&B Golden Curry, mittelscharf 220g       | Weee!: S&B Golden Curry MildHot 220g                |
| 고추장              | Asiafoodland: O’Food Gochujang 500g               | Weee!: Chung Jung One O’Food Gochujang 500g         |
| 고춧가루            | Handokmall: Shinseonmi Kimchi용 / fine, 각각 454g | Weee!: Jayone coarse 220g, 다른 브랜드임을 표시     |

직접 확인한 판매 상품의 상세 링크 10개를 사용합니다. 기존 Sanity 이미지도 확인하여 Imuraya, O’Food, Shinseonmi 브랜드를 식별했습니다. 사진만으로 확정할 수 없는 팥앙금의 원래 용량이나 고춧가루의 입자 종류를 임의로 단정하지 않습니다. 미국에서 다른 브랜드를 연결하는 경우 제품 옆에 대체 브랜드임을 표시합니다.

가격·재고·배송은 판매 페이지에서 확인합니다. 영어 안내는 글로벌 독자를 대상으로 유지하고 Weee! 제품에는 미국 영역을 표시합니다. 상품 데이터는 `lib/ingredientShoppingProducts.json`에서 관리하며 새 후보를 확인한 후 항목을 수정할 수 있습니다.

상품을 직접 구입하거나 사용했다는 문구가 있는 기존 Sanity 제품 메모와는 별도 영역입니다. 새 구매처를 개인 사용 후기처럼 표현하지 않습니다.

CMS 내용 수정이나 새 서비스 가입 없이 배포할 수 있습니다. 새 유료 기능, 쇼핑몰 API, 방문자 위치 추적은 없습니다.

## 제휴 전환 준비

현재 `lib/affiliate-links.json`은 빈 목록입니다. 이 변경으로 제휴 수익이 발생하지는 않습니다. 이미 있는 일반 링크와 광고 표시 도구를 재사용합니다.

승인 후에는 발급된 실제 링크, 승인된 사이트 및 사용 가능 상품을 확인하고 기존 등록 방식으로 전환합니다. `approved: true`, 정확한 원본 URL과 언어 일치, `AFFILIATE_LINKS_ENABLED=true`가 모두 충족될 때만 제휴 링크가 빌드됩니다. 광고 링크 옆 표시와 해당 영역의 수수료 안내가 함께 나타납니다. 미국 링크는 전환 후에도 미국 영역에 남습니다.

제휴 전환은 각 제품 URL을 원본으로 등록합니다. 쇼핑몰 첫 화면을 원본으로 등록한 항목은 제품 URL에 자동 적용되지 않습니다. 실제 제휴 보상 대상 및 Weee! 입점 판매자 상품의 보상 가능 여부는 승인 프로그램 조건으로 확인합니다. momogo와 Handokmall의 제휴 프로그램 가입 가능 여부는 이번 변경에서 확인하지 않았으며 일반 제품 링크로 연결합니다.

## 세금번호를 기다리는 동안 진행할 일

1. 이 PR의 Preview에서 아래 다섯 재료의 영어·독일어 페이지를 확인하고 병합합니다. Studio 재배포는 필요 없습니다.
2. 신청 후보는 독일 REWE DE(Awin 11652)와 Asiafoodland(Awin 15939), 미국 Weee!로 정합니다. 여러 네트워크에 한꺼번에 가입하지 않고 먼저 가능한 경로를 확인합니다.
3. 실제 상품 후보는 레시피에서 사용한 종류와 맞춥니다. 고추장은 소스와 페이스트를 구별하고, 팥앙금은 달게 만든 앙금인지, 카레는 루 블록인지, 고춧가루는 입자 크기가 용도에 맞는지 확인합니다. 밀가루는 Type 550 표기를 확인합니다.
4. 등록한 Awin 사이트·소개를 준비된 재료 페이지와 맞춥니다. 세금번호가 도착하면 정산 정보 및 광고주별 승인을 마무리합니다.
5. 레시피는 주 1개를 목표로 채팅에서 정리해 올리고 관련 재료 설명을 함께 연결합니다. 최근 검색 데이터에서 관심이 확인된 Danpatbbang·Soboro와 이 재료 안내를 연결해 활용합니다.

### 신청 시 사용할 짧은 소개

REWE용 독일어 소개(150자 이하):

> Koreanische Rezepte auf leckere-koreanische-rezepte.de. REWE passt zu meinen Zutaten-Guides für Mehl und alltägliche Kochzutaten.

Asiafoodland용 독일어 소개(150자 이하):

> Koreanische Rezepte auf leckere-koreanische-rezepte.de. Passende Produkte verlinke ich in Zutaten-Guides und Rezepten.

Weee!는 공식 제휴 신청 페이지와 FlexOffers의 SayWeee.com 프로그램 안내를 확인했습니다. 독일 거주 사업자가 참여·정산할 수 있는지와 웹사이트 홍보 허용 여부는 공개 자료만으로 확정하지 못했습니다. 공식 안내의 affiliate@sayweee.com으로 다음 내용을 확인할 수 있습니다. 이 변경에서는 문의를 발송하거나 가입하지 않았습니다.

> I run Hansik Young (https://www.hansikyoung.com), an English-language Korean recipe and ingredient guide website, and my business is based in Germany. May a Germany-based publisher join your affiliate program to refer US readers? Please confirm website eligibility, the application route, payout availability for Germany, and whether product links and repeat-customer orders qualify.

## 검토와 검증

- `node --test tests/ingredient-shopping-guides.test.cjs tests/ingredient-guide-display.test.cjs tests/purchase-links.test.cjs`
- `npm run build`
- 패키지의 `verify-products.py`: 실제 빌드 결과 10개 페이지에서 제품 제목·상세 링크·국가 구분·본문 및 검색 설정을 확인합니다.
- Preview에서 모바일·데스크톱의 안내 영역, 외부 링크, 기존 이미지와 관련 레시피를 확인합니다.

## 공식 자료 (확인: 2026-10-03)

- REWE 자체 프로그램: https://www.rewe.de/partnerprogramm/
- REWE DE Awin: https://ui.awin.com/merchant-profile/11652
- Asiafoodland Awin: https://ui.awin.com/merchant-profile/15939
- Weee! 공식 제휴: https://www.weee.com/company/affiliates-en
- Weee! 미국 배송 지역: https://www.weee.com/en/grocery-delivery
- FlexOffers 프로그램: https://www.flexoffers.com/affiliate-programs/sayweee-com-affiliate-program/

공개 소개 페이지의 수수료·프로모션은 실제 승인 계약과 다를 수 있으므로 이 문서에 고정 수익률이나 예상 수익을 적지 않습니다. Weee!의 직접 프로그램과 FlexOffers 프로그램이 동일 조건이라고 가정하지 않습니다.

## 확인된 제품 상세 페이지

- DE / REWE Beste Wahl Weizenmehl Type 550 · 1 kg / REWE: https://www.rewe.de/shop/p/rewe-beste-wahl-weizenmehl-type-550-1kg/9959918
- DE / Imuraya Yude Azuki · 200 g / momogo: https://www.momogo.de/produkt/imuraya-yude-azuki-200g-susse-japanische-rotbohnen-in-dosen
- EN / Shirakiku sweet red bean paste, tsubuan · 500 g / Weee!: https://www.weee.com/en/product/Shirakiku-Red-Bean-Paste-Tsubuan--Coarse/81864
- DE / S&B Golden Curry, mittelscharf · 220 g / momogo: https://www.momogo.de/produkt/s-b-golden-curry-mittelscharf-220g
- EN / S&B Golden Curry, MildHot · 220 g / Weee!: https://www.weee.com/en/product/S-B-Golden-Curry-Japanese-Curry-MildHot-Flavor220g/3002497/
- DE / O’Food Gochujang · 500 g / Asiafoodland: https://www.asiafoodland.de/gochujang-koreanische-chilipaste-red-pepper-500-g.html
- EN / Chung Jung One O’Food Gochujang · 500 g / Weee!: https://www.weee.com/en/product/Chung-Jung-One-O-Food-Gochujang/107127
- DE / Shinseonmi Chilipulver für Kimchi · 454 g / Handokmall: https://handokmall.de/de/shinseonmi-chilipulver-fuer-kimchi-454g/15551
- DE / Shinseonmi Chilipulver, fein · 454 g / Handokmall: https://handokmall.de/de/shinseonmi-chilipulver-fein-454g/15563
- EN / Jayone red chili powder, coarse · 220 g / Weee!: https://www.weee.com/en/product/Jayone-Red-Chili-Powder--Coarse/80457
