# 독일·미국 구매처 안내와 다음 수익화 단계

## 이번 변경

재료 설명에서 실제로 찾아볼 구매처로 이동할 수 있도록 작은 안내 영역을 추가합니다.

| 재료                                | 독일 페이지                                       | 영어 페이지                                                    |
| ----------------------------------- | ------------------------------------------------- | -------------------------------------------------------------- |
| Weizenmehl Type 550                 | REWE 시작 링크, 지역 상품·배송·수령 확인          | 현지 슈퍼마켓·제분업체 안내, 다른 나라의 밀가루 이름 차이 설명 |
| 팥앙금·Golden Curry·고추장·고춧가루 | Asiafoodland 시작 링크 및 현지 아시아 식품점 안내 | 현지 구매처 안내 + 미국 독자를 위한 Weee! 링크                 |

링크는 매장 시작 페이지입니다. 특정 상품의 재고, 가격 또는 레시피와의 완전한 일치를 보장하지 않습니다. 독자가 사용할 검색어와 확인할 항목을 함께 표시합니다. 영어 설명은 글로벌 독자를 대상으로 유지하고 미국 구매처에는 국가를 표시합니다.

상품을 직접 구입하거나 사용했다는 문구가 있는 기존 Sanity 제품 메모와는 별도 영역입니다. 새 구매처를 개인 사용 후기처럼 표현하지 않습니다.

CMS 내용 수정이나 새 서비스 가입 없이 배포할 수 있습니다. 새 유료 기능, 쇼핑몰 API, 방문자 위치 추적은 없습니다.

## 제휴 전환 준비

현재 `lib/affiliate-links.json`은 빈 목록입니다. 이 변경으로 제휴 수익이 발생하지는 않습니다. 이미 있는 일반 링크와 광고 표시 도구를 재사용합니다.

승인 후에는 발급된 실제 링크, 승인된 사이트 및 사용 가능 상품을 확인하고 기존 등록 방식으로 전환합니다. `approved: true`, 정확한 원본 URL과 언어 일치, `AFFILIATE_LINKS_ENABLED=true`가 모두 충족될 때만 제휴 링크가 빌드됩니다. 광고 링크 옆 표시와 해당 영역의 수수료 안내가 함께 나타납니다. 미국 링크는 전환 후에도 미국 영역에 남습니다.

매장 시작 링크가 실제 제휴 보상 대상인지는 프로그램별 확인이 필요합니다. 상품 링크가 필요한 프로그램은 확인된 상품 링크를 먼저 추가한 후 등록합니다.

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
- 패키지의 `verify-shopping.py`: 실제 빌드 결과 10개 페이지에서 국가 구분·일반 링크·본문 및 검색 설정을 확인합니다.
- Preview에서 모바일·데스크톱의 안내 영역, 외부 링크, 기존 이미지와 관련 레시피를 확인합니다.

## 공식 자료 (확인: 2026-10-03)

- REWE 자체 프로그램: https://www.rewe.de/partnerprogramm/
- REWE DE Awin: https://ui.awin.com/merchant-profile/11652
- Asiafoodland Awin: https://ui.awin.com/merchant-profile/15939
- Weee! 공식 제휴: https://www.weee.com/company/affiliates-en
- Weee! 미국 배송 지역: https://www.weee.com/en/grocery-delivery
- FlexOffers 프로그램: https://www.flexoffers.com/affiliate-programs/sayweee-com-affiliate-program/

공개 소개 페이지의 수수료·프로모션은 실제 승인 계약과 다를 수 있으므로 이 문서에 고정 수익률이나 예상 수익을 적지 않습니다. Weee!의 직접 프로그램과 FlexOffers 프로그램이 동일 조건이라고 가정하지 않습니다.
