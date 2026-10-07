# 레시피 작성자 소개와 분류 경로

레시피 상단에 `Recipe by Joan / Rezept von Joan`과 소개 페이지 링크를 표시합니다. 공개 이름은 기존 사이트에서 사용하는 Joan입니다. 소개 페이지에도 Joan이 집에서 직접 요리하며 레시피를 모으는 사람이라는 문장을 추가합니다. 영어 소개는 세계 어디서든 이해할 수 있는 내용으로 유지하고, 독일어 소개의 현지 재료 이야기는 유지합니다.

각 레시피 위에는 `Home / Startseite → 분류 → 레시피` 경로가 나옵니다. 분류는 기존 사이트가 실제로 사용하던 분류 정보에서 가져오고, 클릭하면 해당 언어의 분류 페이지로 돌아갑니다. 현재 레시피는 경로의 마지막 항목에 표시합니다.

검색 정보에도 같은 작성자와 경로를 전달합니다.

- `Recipe.author`: Joan과 해당 언어의 소개 페이지.
- 두 언어 모두 작성자의 동일한 공개 식별 주소 `https://www.hansikyoung.com/about-us#joan` 사용.
- 소개 페이지의 `Person` 정보와 실제 화면의 `joan` 소개 위치 연결.
- `BreadcrumbList`: 화면에 보이는 경로와 같은 순서, 이름, 목적지.
- 레시피의 `url`과 식별 주소는 기존 canonical 사용.

출처가 없는 자격, 수상, 평점, 영양 정보는 추가하지 않습니다. 기존 조리 내용과 최초 게시일은 그대로 사용하며, Sanity 문서 수정이나 Studio 배포는 필요하지 않습니다.

## 배포 후 확인

로컬에서는 전체 빌드 후 `python3 scripts/check-recipe-author-breadcrumbs.py`로 영어·독일어 레시피의 작성자, 화면 경로, 검색 정보, 실제 분류 페이지 연결을 검사할 수 있습니다.

1. 영어·독일어 레시피에서 작성자 소개와 분류 경로를 누릅니다.
2. 분류 화면에 방금 본 레시피가 있고, 언어가 유지되는지 확인합니다.
3. 소개 페이지에 Joan의 소개가 표시되는지 확인합니다.
4. 대표 레시피를 Google 리치 결과 테스트로 검사합니다. 이 도구의 실제 검사 결과는 별도로 확인해야 하며, 로컬 빌드 검사와 같지 않습니다.

새 레시피를 게시할 때 작성자나 분류 경로를 따로 입력할 필요는 없습니다. 기존 분류 선택으로 자동 생성됩니다.

공식 문서:

- https://developers.google.com/search/docs/appearance/structured-data/recipe
- https://developers.google.com/search/docs/appearance/structured-data/breadcrumb
- https://search.google.com/test/rich-results
