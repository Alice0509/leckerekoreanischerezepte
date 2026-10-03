# 입문자 가이드와 영어 고춧가루 설명 적용

## 웹사이트 가이드

이번 PR은 `/korean-pantry`에 영어·독일어 입문자 가이드를 추가합니다. 재료 목록에서 들어갈 수 있으며, 간장·참기름·고추장·고춧가루 설명과 기존 불고기·시금치나물·떡볶이 레시피를 연결합니다. 구매처 링크는 기존에 확인한 제품 상세 주소를 사용합니다. 영어 사이트의 미국 제품 링크에는 국가 표시가 있으며 독일 구매 안내는 독일어 사이트에만 표시합니다.

PR Preview에서 두 언어의 페이지와 링크를 확인한 뒤 병합합니다. 기존 웹사이트 배포가 적용하며 Sanity Studio 재배포는 필요 없습니다.

## 고춧가루 영어 설명

웹사이트 PR과 별도로 Sanity 데이터 변경이 필요합니다. `prepare-gochugaru-draft.sh`는 기존 독일어 설명, 사진, 이름, 주소, SEO 문구를 유지한 채 English 소개만 검토용 초안으로 만듭니다. 게시된 문서를 직접 수정하거나 자동으로 공개하지 않습니다.

기존 편집 초안이 있거나 영어 설명이 준비 당시와 달라졌다면 중단합니다. 중단 메시지를 확인하고 기존 내용을 먼저 검토합니다. 새 초안이 생긴 경우 Studio에서 고춧가루 재료를 열어 English 소개와 기존 German 소개·사진을 확인한 뒤 Publish합니다. 사이트에 반영되지 않으면 기존 Sanity 게시 웹훅의 배포 상태를 확인합니다.

## 구매 클릭

GA4 계정 설정은 이 PR에서 확인하거나 변경하지 않았습니다. [구매 클릭 측정 안내](./purchase-click-measurement.ko.md)에 따라 외부 클릭 수집과 실제 이벤트를 확인합니다. 구매처 클릭은 매출이 아니며 제휴 링크는 광고주 승인 후 별도로 활성화합니다.

## 개발 검증

```sh
node --test tests/pantry-starter.test.cjs tests/gochugaru-english-draft.test.cjs
npm run build
python3 scripts/verify-pantry-starter.py
```
