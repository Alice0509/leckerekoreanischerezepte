# 초고추장·미역국의 검색 설명과 첫 소개

Search Console에서 선택한 기존 두 레시피의 영어·독일어 검색 제목, 검색 설명, 첫 소개 문단을 준비한다. 초고추장은 달고 시고 매운 식초 기반 소스임을 명확히 하고, 미역국은 미역과 소고기 및 불리기·씻기·끓이기 과정을 먼저 설명한다. 기존의 가족 이야기와 문화 소개는 새 소개 다음에 유지한다.

`content/search-page-growth-updates.json`에 공개된 기존 값과 제안 값을 함께 기록했다. 재료 분량, 단계, 사진, 주소는 수정 대상이 아니다. 검색 제목은 Google이 다르게 표시할 수 있으며 클릭률이나 순위 상승을 보장하지 않는다.

## Sanity 내용에 반영

코드 PR의 Merge만으로 Sanity 내용이 수정되지는 않는다. 새 작업 폴더의 Studio에서 로그인된 CLI를 사용한다.

```bash
cd "$HOME/korean-recipes-pinterest-growth-ready/studio"
npm ci
npx --no-install sanity exec scripts/updateSearchPages.mjs --with-user-token -- --dry-run
```

출력된 제목과 소개를 확인하고 반영하려면:

```bash
npx --no-install sanity exec scripts/updateSearchPages.mjs --with-user-token -- --apply
```

초안이 있거나 준비 이후 제목·소개·주소가 달라지면 변경을 중단한다. 적용 직전 다시 읽고 문서 버전을 비교한다. 두 문서의 수정은 `ifRevisionID`를 사용한 하나의 트랜잭션으로 보낸다. 이미 같은 내용이면 다시 수정하지 않는다. 직접 편집을 이어가는 중에는 Studio 편집을 먼저 마무리한다.

이 작업에는 Studio 자체의 배포나 수동 Publish가 필요 없다. 공개 내용 수정 후 기존 Sanity 웹훅에 따른 사이트 빌드 완료를 기다린다. 사이트 코드 변경은 검토용 PR을 Merge한 뒤 반영된다.

## 검증

- 변경 미리보기, 반복 실행, 초안·주소·기존 편집 보호, 프로젝트·query 설정 검증, 적용 직전 revision 충돌에 대한 테스트.
- 기존 설명은 양쪽 언어에서 그대로 보존하고 새 첫 문단만 앞에 추가한다.
- 검색 자료는 2026-10-04에 전달받았지만 마지막 날짜가 2026-09-29다. 최근 변경 성과로 해석하지 않는다.
- 4주 뒤 같은 기간 길이로 검색 노출·클릭·CTR·순위와 주요 검색어를 비교한다. 기존에 예약한 월간 점검을 사용한다.

## 근거

- [Google: 검색결과 제목](https://developers.google.com/search/docs/appearance/title-link)
- [Google: 검색결과 설명](https://developers.google.com/search/docs/appearance/snippet)
- [Search Console 실적 보고서](https://support.google.com/webmasters/answer/7576553)
- [Sanity patch](https://www.sanity.io/docs/content-lake/http-patches)
- [Sanity transaction](https://www.sanity.io/docs/content-lake/transactions)

5분 소스, 미역·소고기 조리 방식은 기존 공개 레시피에서 확인했다. 새 영양·건강 효과나 시험 조리 경험을 추가하지 않았다.
