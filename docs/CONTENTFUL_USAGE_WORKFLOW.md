# Contentful API 사용 절약 작업 방식

Hansik Young은 월간 Contentful API 호출 한도가 있으므로,
작업 종류에 따라 검증 명령을 구분한다.

## 1. UI만 수정한 경우

다음과 같은 작업이 해당된다.

- CSS 수정
- 모바일 레이아웃 수정
- 문구 수정
- 버튼 및 체크박스 동작 수정
- Contentful 데이터 구조와 무관한 화면 개선

검증:

- `npm run check:ui`
- `git diff --check`

작은 UI 수정마다 Contentful 전체 감사나 전체 빌드를 반복하지 않는다.

## 2. 콘텐츠·URL·데이터 구조를 수정한 경우

다음 작업에서는 전체 검증이 필요하다.

- Contentful 콘텐츠 수정
- 레시피 또는 재료 slug 변경
- canonical URL 및 redirect 변경
- 다국어 경로 변경
- sitemap 생성 방식 변경
- Contentful 조회 코드 변경
- Contentful migration 실행

검증:

- `npm run build:checked`

이 명령은 Contentful 감사 후 프로덕션 빌드를 실행한다.

## 3. 일반 배포 빌드

검증:

- `npm run build`

일반 빌드는 SEO 파일을 생성하고 Next.js 프로덕션 빌드를 실행한다.
레시피와 재료 전체 감사를 자동으로 반복하지 않는다.

## 4. Pull Request 작업 원칙

1. 관련 UI 변경은 가능한 한 하나의 작은 브랜치에서 완료한다.
2. 로컬에서는 `npm run check:ui`를 실행한다.
3. 불필요한 반복 push를 피한다.
4. Vercel Preview 빌드는 가능한 한 한 번만 실행한다.
5. 화면 확인 후 병합한다.
6. 병합 후 Production 빌드를 한 번 실행한다.

push를 반복할 때마다 Vercel Preview 빌드와 Contentful 요청이 추가될 수 있다.

## 5. Contentful migration 원칙

1. 먼저 dry-run을 실행한다.
2. 백업 파일을 보관한다.
3. 실제 적용은 한 번만 실행한다.
4. 적용 후 검증도 한 번만 실행한다.
5. 이미 검증이 끝난 migration을 반복 실행하지 않는다.

## 6. 현재 월간 한도 보호

Contentful 사용량이 높은 동안에는 다음 원칙을 지킨다.

- UI 수정에는 Contentful 감사를 실행하지 않는다.
- 로컬 전체 빌드를 반복하지 않는다.
- CMA migration은 꼭 필요한 경우가 아니면 중단한다.
- 여러 UI 변경을 모은 뒤 마지막에 전체 빌드를 한 번만 실행한다.
