# 해외 독자를 위한 계량 안내

## 이번 변경

- 모든 레시피의 재료 목록 위에 영어·독일어 공통 계량 안내를 접어서 제공합니다.
- 재료 이름과 분량을 별도 줄로 표시합니다. 긴 분량 문구가 좁은 재료 열을 차지해 이름과 겹치던 문제를 줄입니다.
- 비빔 소스는 원래 비율 2 : 1 : 2 : 2 : 2 : 1.5 : 1 : 3을 유지하면서 `parts` / `Teile`로 표시합니다. 깨는 기호에 맞게 마지막에 뿌립니다.
- 1 part / 1 Teil은 선택한 동일한 스푼 1회 분량입니다. 계량스푼을 선택해도 되며, 큰 스푼을 선택하면 소스 총량이 늘어납니다. 면에 넣는 양은 조절합니다.
- 사과식초·사진·인분·예상 준비 시간·나머지 조리 단계·기존 식재료 연결은 유지합니다.

## 앞으로 채팅에서 레시피를 정리할 때

1. **비율 양념**: 사용자가 비율이라고 확인한 경우 `2 parts` / `2 Teile`처럼 표시합니다. 같은 스푼, 평평하게 담기, 큰 스푼을 쓰면 총량이 달라진다는 설명은 한 번만 넣습니다. 다른 계량법을 섞어 쓰지 않습니다.
2. **계량스푼을 실제로 사용한 경우**: 표시된 용량을 확인한 뒤 tbsp/EL, tsp/TL를 사용합니다. 일반적인 미터법 계량스푼은 15 ml와 5 ml지만 세트의 표기를 확인합니다.
3. **밥숟가락으로 만든 고정 인분 레시피**: 사용자의 숟가락 양을 임의로 15 ml나 g으로 바꾸지 않습니다. 사용자가 다음 조리 때 실측할 수 있는 액체부터 ml, 중요한 재료부터 g으로 확인합니다. 확인 전에는 그 레시피에 밥숟가락 기준임을 별도로 표시합니다.
4. **베이킹**: 검증된 g·ml를 우선하고 계량스푼을 쓴 소량 재료는 용량과 평평하게 담는 조건을 확인합니다. 비율 소스의 계량 방법을 빵이나 다른 정밀 레시피에 확대하지 않습니다.

공통 안내는 기존 레시피 분량의 확인·수정을 대신하지 않습니다. 기존 EL/tbsp 표기가 실제 계량스푼이었는지 미확인인 경우, 자동으로 15 ml 기준이라고 선언하지 않습니다. 다른 레시피는 원저자와 확인하며 순차적으로 정리합니다.

2026-10-04 공개 스냅샷의 영어 조리 재료 문서 520개 중 231개에 tbsp/tsp/spoon 관련 표기가 있었습니다. 재료 자체의 개수가 아니라 레시피에 연결된 분량 문서 수입니다. 우선 확인할 예시는 떡볶이의 `1.3 tbsp`, 잡채의 `4 2/3 tbsp (~70ml)`, 초고추장의 `1,5 tbsp (~22,5g)`입니다. 밥숟가락인지 계량스푼인지, g 병기가 실제 재료를 계량한 값인지 확인한 뒤 수정합니다. 특히 부피와 무게의 환산은 재료마다 다르므로 같은 숫자로 일괄 처리하지 않습니다.

## 이미 공개한 비빔 소스 수정

가져오기 파일을 다시 가져오지 마세요. 같은 레시피가 이미 존재합니다.

```bash
cd "$HOME/korean-recipes-measurement-ready/studio"
npx --no-install sanity exec scripts/updateBibimMeasurements.mjs --with-user-token -- --dry-run
```

`--dry-run`은 미리보기입니다. 공개 내용을 수정하려면 다음 명령을 실행합니다.

```bash
npx --no-install sanity exec scripts/updateBibimMeasurements.mjs --with-user-token -- --apply
```

`--apply`는 검토한 분량 8개와 소개·첫 조리 단계의 계량 설명을 **공개 문서에 바로 반영**합니다. 이 작업에 한정된 10개 필드를 한 트랜잭션으로 수정합니다. 개별 단계마다 Publish할 필요가 없습니다. 작성 중인 관련 초안이나 준비 이후 바뀐 분량·설명이 발견되면 중단합니다. 사진·다른 필드는 덮어쓰지 않습니다. 다시 실행할 때 이미 같은 내용이면 변경하지 않습니다.

변경 직전 다시 읽고 각 수정에 버전 조건을 붙입니다. 관련 초안의 존재는 실행 직전 검사이며, 검사와 쓰기 사이에 다른 편집기를 동시에 사용하지 마세요.

공통 화면 안내는 웹사이트 PR을 merge한 뒤 배포됩니다. 이 스크립트는 Sanity Studio 화면 자체를 바꾸지 않으므로 Studio 재배포는 필요하지 않습니다.

## 근거

- [Dr. Oetker: Mengenangaben beim Backen umrechnen](https://www.oetker.de/inspiration/tipps-tricks/t/mengenangaben-beim-backen-umrechnen): 일반 숟가락 크기와 담는 방법의 차이, 액체의 15 ml/5 ml 기준, 재료별 무게 차이.
- [Yamazaki Home Europe: Magnetic Measuring Spoon](https://theyamazakihome-europe.com/collections/magnetic-attachment/products/magnetic-measuring-spoon): 실제 계량도구의 15 ml/5 ml 표기.
- [King Arthur Baking: Measuring spoons](https://www.kingarthurbaking.com/blog/2022/07/27/7-tips-for-using-measuring-spoons-the-right-way): 평평하게 계량하는 방법과 정밀도가 필요한 소량 재료.

일반 계량 사실만 참고했으며 소스의 재료와 비율은 사용자가 제공한 레시피입니다. 특정 밥숟가락의 용량이나 재료별 g 변환치는 추정하지 않았습니다.
