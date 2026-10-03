# 식재료 설명 표시 수정

Sanity의 공개 설명이 있어도 연결된 구매 제품이 없으면 식재료 페이지 본문에 설명이 나타나지 않았다. 제품이 여러 개면 같은 설명과 안내가 제품마다 반복됐다.

설명·구매처·쓰임·대체 안내를 구매 제품 목록에서 분리해 페이지에 한 번 표시한다. 제품 카드는 사진·제품명·메모·기존 구매 링크를 보여준다. 사진이 없는 재료의 상단 요약은 한 열을 사용한다.

밀가루(Type 550), 팥앙금, Golden Curry에는 재료에 맞는 영어·독일어 안내를 사용한다. 영어 구매 안내는 독자의 국가에 배송되는 매장을 찾도록 하고, 독일어 구매 안내는 독일 기준이다. 구매처·보관 FAQ와 FAQ 구조화 데이터는 같은 안내를 사용한다. 다른 재료의 기존 안내는 유지하며, 일반 보관 FAQ는 포장 안내를 따르도록 한다.

## 확인

```bash
node --test tests/ingredient-guide-display.test.cjs
npm run build
```

회귀 검사 7개는 실제 페이지 컴포넌트와 Rich Text 렌더러를 사용한다. 구매 제품 없음·여러 개, 두 언어, 재료별 FAQ, 글로벌 영어 안내, 기존 링크, 링크로만 구성된 설명을 확인한다. Next.js 프레임워크 경계는 검사에서 대체한다.

production 공개 내용을 가져온 전체 빌드: 276페이지 성공. 생성된 HTML에서도 두 언어의 밀가루·팥앙금·Golden Curry 설명 본문과 단일 설명 영역, 기존 사진 및 구매 링크 유지 여부를 확인했다. 브라우저에서 모바일·데스크톱 표시 검토는 PR Preview에서 진행한다.

이 변경은 데이터셋이나 레시피 단계·분량을 수정하지 않는다. Awin 제휴 링크도 활성화하지 않는다.

## 내용 근거

- [VGMS 밀가루 분류](https://www.vgms.de/produkte/lebensmittel/mehl-und-mahlerzeugnisse)
- [King Arthur Baking: 밀가루 선택](https://www.kingarthurbaking.com/blog/2022/09/22/bread-flour-vs-all-purpose-flour)
- [Kikkoman: 팥앙금](https://www.kikkoman.com/en/cookbook/glossary/anko.html)
- [S&B: Golden Curry roux](https://www.sbfoods-worldwide.com/products/search/005.html)
- Golden Curry의 110 g·220 g 분량과 단팥빵·소보로 용도는 기존 공개 레시피에서 확인했다.

브랜드별 재고, 제휴 승인, 모든 대체 재료로의 시험 조리 여부를 보장하는 안내는 포함하지 않는다.
