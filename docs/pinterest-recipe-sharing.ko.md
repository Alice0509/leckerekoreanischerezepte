# 레시피에서 Pinterest 게시물 준비하기

레시피 아래 `Share this recipe / Dieses Rezept teilen`을 열면 Pinterest 이미지와 제목·설명·링크를 준비할 수 있습니다. 매번 별도 이미지 파일을 요청할 필요 없이 현재 공개된 레시피의 사진과 소개를 사용합니다.

## 게시 순서

1. 영어 게시물은 `www.hansikyoung.com`, 독일어 게시물은 `www.leckere-koreanische-rezepte.de`에서 원하는 레시피를 엽니다.
2. 공유 영역에서 `Download Pinterest image / Pinterest-Bild herunterladen`을 누릅니다. 저장되는 PNG는 1000 × 1500(2:3)입니다. 기존 사진 전체를 프레임에 맞추고 제목을 위에 붙입니다.
3. Pinterest의 `Create Pin`에서 이미지 파일을 올립니다. 사이트의 제목·설명·링크를 각각 복사해 Pinterest의 해당 칸에 붙여 넣습니다. 레시피 링크는 반드시 별도 Link 칸에 넣습니다.
4. 내용을 확인하고 적절한 보드를 선택합니다. 영어 비빔 소스는 `Korean Recipes for Everyday Cooking`, 일본 카레는 `Easy Asian Home Cooking`, 독일어 글은 `Rezepte auf Deutsch`에 넣을 수 있습니다.
5. 원본 사진이 AI로 생성되거나 편집됐다면 Pinterest에서 AI-Modified를 표시합니다. 게시 후 방문 버튼을 눌러 정확한 언어의 레시피가 열리는지 확인합니다.

제목은 최대 100자, 설명은 최대 800자로 준비됩니다. 설명은 현재 레시피의 소개를 가져오므로 게시 화면에서 첫 문장을 다듬어도 좋습니다. 글에 없는 시간·영양·효능을 추가하지 않습니다. 일본 카레를 한국 전통 음식으로 소개하지 않습니다.

기존 1080 × 1350 공유 이미지와 일반 링크·소개 복사도 계속 사용할 수 있습니다. Pinterest가 자동으로 열리거나 자동 게시되지는 않으며, 계정 연결은 필요하지 않습니다.

## 방문 확인

Pinterest용 링크에는 `utm_source=pinterest`, `utm_medium=social`, `utm_campaign=recipe_discovery`, `utm_content=레시피주소_언어`가 붙습니다. 개인 식별값은 넣지 않습니다. 실제 레시피 주소와 언어는 현재 페이지의 canonical을 사용합니다.

게시 후 Pinterest의 outbound clicks와 저장 수를 봅니다. GA4는 기존 분석 동의 범위에서 유입을 구분하는 보조 자료로 사용합니다. 이 기능은 새로운 분석·광고 태그를 설치하지 않습니다.

처음에는 매주 레시피 하나를 골라 Pin 하나씩 올립니다. 음식의 장점과 실제로 써 본 대체 재료를 소개하는 문구를 바꿔 보되, 같은 이미지를 짧은 간격으로 반복 게시하지 않습니다.

## 배포 확인

웹 PR을 merge하고 Vercel Production 배포가 완료되면 사용할 수 있습니다. Sanity 문서 수정이나 Studio 배포는 필요하지 않습니다.

- EN/DE 제목·설명·링크가 각각 올바른지 확인합니다.
- PNG가 1000 × 1500으로 내려받아지고 사진 전체가 유지되는지 확인합니다.
- 클립보드가 허용되지 않으면 표시된 텍스트를 직접 선택·복사합니다.
- 사진을 불러오지 못해도 제목·설명·링크 복사를 사용할 수 있습니다.

공식 안내:

- https://help.pinterest.com/en/article/create-a-pin-from-an-image-or-video
- https://help.pinterest.com/en/article/review-pin-specs
- https://help.pinterest.com/en/business/article/pinterest-product-specs
