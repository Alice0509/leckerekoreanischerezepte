# Asiafoodland 고추장·참기름 제휴 연결

2026-10-13: 소유자가 Awin Joined 화면에서 Asiafoodland 승인을 확인하고 Link Builder에서 발급한 상품 링크 2개를 제공했습니다.

- 광고주: Asiafoodland, `15939`
- Publisher: Hansik Young, `3113363`
- 기존 독일어 제품 예시: O’Food 고추장 500g, 오뚜기 볶은 참기름 160ml
- 적용 위치: 해당 재료 구매 안내, 연결된 레시피 구매 안내, `/gallery`의 승인된 구매 옵션

제공된 Awin URL을 그대로 사용하며 목적지 상품 URL을 기존 제품 예시와 정확히 짝지었습니다. 기존 REWE 6개 항목은 유지합니다. 영어 사이트에는 이번 독일 구매 링크를 적용하지 않습니다.

## 검토와 배포

기존 `AFFILIATE_LINKS_ENABLED=true` 설정을 재사용합니다. 이미 REWE 제휴 표시가 나오는 프로젝트라면 새 환경 변수나 추가 광고 코드는 필요 없습니다. Preview에서도 이 값이 활성화되어야 제휴 주소와 표시를 확인할 수 있습니다.

검토용 PR의 Vercel 빌드가 성공하면 모바일로 다음 주소를 확인합니다.

- `/de/ingredients/gochujang`
- `/de/ingredients/sesame-oil`
- `/de/recipes/ssamjang-korean-bbq-dipping-sauce`
- `/de/gallery`

제품명, Deutschland와 `Werbung · Affiliate-Link` 표시를 확인합니다. 구매 버튼의 주소에 광고주 `15939`와 Publisher `3113363`, 해당 상품 목적지가 있는지 확인합니다. 실제 클릭 확인은 소유자가 필요한 만큼만 수행합니다. 자동 테스트에서는 추적 링크에 접속하지 않습니다.

검토 후 merge하면 사이트가 배포됩니다. Sanity 문서·Studio 배포·Publish는 필요 없습니다. Awin의 주문 인정과 확정 수수료가 실제 수익의 기준이며 승인·클릭만으로 매출을 집계하지 않습니다.

## 성과 구분

기존 GA4 구매처 클릭 필터의 `awin1.com`을 재사용합니다. 같은 추적 도메인이라도 REWE는 `awinmid=11652`, Asiafoodland는 `awinmid=15939`로 구분합니다. GA4는 현재 분석 동의한 방문의 클릭만 반영하며, Awin 주문·확정 수수료는 별도로 확인합니다.

## 공식 안내

- 프로그램: https://ui.awin.com/merchant-profile/15939
- Link Builder: https://success.awin.com/articles/en_US/Knowledge/How-can-I-use-Link-Builder-to-create-Deep-Links

상품 재고·가격·배송 조건은 판매처에서 확인합니다. 이번 변경은 제품 예시의 제휴 연결이며 소유자가 해당 브랜드를 직접 사용했다는 새로운 경험 주장을 추가하지 않습니다.
