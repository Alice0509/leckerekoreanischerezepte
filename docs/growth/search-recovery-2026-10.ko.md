# 2026년 10월 검색 개선: 확인된 문제부터 수정

이번 변경은 검색 노출과 독자의 사용성을 개선하기 위한 작업입니다. AdSense 거절 사유를 확정한 것은 아니며 승인·색인·매출 증가를 보장하지 않습니다.

## 적용 범위

- 현재 대응 페이지가 확인된 옛 주소 3종(`%20Tofu`, `MincedGarlic`, `Typ%20550`)을 대표 재료 주소로 영구 이동합니다. 기존 `Gochujang` 이동을 보존합니다.
- 당면, 떡볶이 떡, 찹쌀가루, 양조간장, 춘장, 다시마의 소개·구매 시 확인점·용도·대체·보관 안내를 EN/DE로 구체화합니다. 진간장에는 이미 별도 가이드가 있으므로 보존합니다.
- 기존 Sanity 설명, 레시피 분량, 제품 선택과 제휴 승인 설정은 수정하지 않습니다. 영어 안내는 국가에 종속되지 않으며 독일 안내는 독일 독자를 대상으로 합니다.
- 현재 상세 페이지가 없는 다른 재료를 홈페이지로 보내거나, 색인을 늘리기 위해 상세 페이지·상품 추천을 임의로 만들지 않습니다.

## 확인된 수치

사용자 제공 Search Console 내보내기 기준입니다. 검색 클릭은 전체 방문·페이지뷰·구매 수가 아닙니다.

| 28일             | 독일 클릭 | 독일 노출 | 영어 클릭 | 영어 노출 |
| ---------------- | --------: | --------: | --------: | --------: |
| 2026-08-23~09-19 |        74 |     3,232 |        10 |     3,249 |
| 2026-09-20~10-17 |       101 |     3,927 |        41 |     6,030 |

독일의 ‘크롤링됨–현재 색인이 생성되지 않음’ 30개 예시 주소를 10월 19일 현재 응답과 대조한 결과: 현재 사이트맵 내 7개, 404 14개, noindex 3개, 그 외 6개입니다. 보고서 최종 집계일은 10월 12일이며 일부 주소의 최종 크롤링은 수개월 전입니다. 현재 응답과 보고서 상태가 같을 필요는 없습니다.

‘발견됨–현재 색인이 생성되지 않음’ 38개는 이번 상세 내보내기에 포함되지 않았습니다. 별도 목록을 받기 전에는 해당 페이지를 추정하지 않습니다.

## merge 후 확인

Vercel 프로덕션 배포가 끝나면 아래 옛 주소가 새 주소로 연결되는지 확인합니다. Sanity Studio 배포나 Publish는 필요 없습니다.

- `/ingredients/%20Tofu` → `/ingredients/tofu`
- `/ingredients/MincedGarlic` → `/ingredients/minced-garlic`
- `/ingredients/Typ%20550` → `/ingredients/wheat-flour-type-550`

영어·독일어 사이트의 당면과 떡볶이 떡 페이지를 모바일로 확인합니다. 기존 설명은 ‘Full ingredient guide / Mehr über diese Zutat’ 안에 보존됩니다.

Search Console에서 독일 속성을 선택하고 상단 ‘URL 검사’에 아래 대표 주소를 하나씩 붙입니다. Google이 선택한 표준 URL, 색인 여부와 실시간 테스트를 확인합니다. 접속 가능하고 검색 제외가 없는 중요 페이지가 미색인이라면 ‘색인 생성 요청’을 한 번 사용합니다. 반복 제출로 색인을 보장할 수는 없습니다.

- https://www.leckere-koreanische-rezepte.de/ingredients/tteokbokki-tteok
- https://www.leckere-koreanische-rezepte.de/ingredients/dangmyeon
- https://www.leckere-koreanische-rezepte.de/ingredients/klebreismehl
- https://www.leckere-koreanische-rezepte.de/ingredients/yangjo-ganjang
- https://www.leckere-koreanische-rezepte.de/ingredients/chunjang
- https://www.leckere-koreanische-rezepte.de/ingredients/kelp-dashima
- https://www.leckere-koreanische-rezepte.de/ingredients/jinganjang

## 다음 성장 작업의 판단 기준

독일 돈가스·육개장, 두 언어의 지코바·단팥빵은 기존 검색 실적을 바탕으로 우선 검토합니다. 페이지별 검색어·노출·클릭을 비교한 뒤 제목과 설명을 바꿉니다. 이번 PR에서는 추측으로 제목을 일괄 변경하지 않습니다.

독일 돈가스의 기존 재료 구매 링크는 현행대로 보존합니다. 구매 경로별 추적·매출 분석은 별도 작업이며 이번 변경에 새 추적 스크립트를 넣지 않습니다. 본인 테스트 클릭을 실제 고객 관심으로 해석하지 않습니다.

배포 후 변경 날짜를 기록하고 충분한 데이터가 쌓이면 같은 길이의 기간을 비교합니다. 작은 수치의 단기 변동이나 Google의 색인 상태만으로 매출 효과를 주장하지 않습니다.

## 내용 확인에 사용한 자료

새로운 개인 사용 경험이나 검증되지 않은 조리 시간을 만들지 않고, 기존 사이트 설명과 아래 자료를 참고해 제품 구분을 작성했습니다.

- 샘표 간장 종류와 활용: https://www.sempio.com/product/ganjang/04
- 샘표 양조간장 제조 설명: https://www.sempio.com/product/ganjang/03
- Korean Bapsang의 당면 설명: https://www.koreanbapsang.com/japchae-korean-stir-fried-starch/
- Maangchi의 찹쌀가루 설명: https://www.maangchi.com/ingredient/sweet-rice-flour
- Maangchi의 춘장 설명: https://www.maangchi.com/ingredient/chunjang
- Maangchi의 다시마 설명: https://www.maangchi.com/ingredient/kelp
- Google 색인 보고서: https://support.google.com/webmasters/answer/7440203

안내는 일반적인 재료 구분이며 실제 제품의 포장·보관·조리 지시와 해당 레시피를 우선합니다.
