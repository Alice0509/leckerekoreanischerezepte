# REWE 첫 제휴 링크 연결

2026-10-09: 소유자가 Awin의 Joined 목록에서 Rewe DE를 확인했고, Link Builder에서 발급한 밀가루 상품 링크를 제공했습니다.

- 광고주: Rewe DE, 11652
- Publisher: Hansik Young, 3113363
- 상품: REWE Beste Wahl Weizenmehl Type 550, 1 kg (9959918)
- 적용 언어: 독일어
- 적용 위치: 해당 재료의 구매 안내, 이 재료가 들어가는 레시피의 구매 안내, /gallery의 승인된 구매 옵션

기존 제품 URL과 발급된 제휴 URL을 정확히 짝지었습니다. 다른 제품이나 다른 광고주를 승인된 것으로 취급하지 않습니다. 영어 사이트의 밀가루 안내는 독자 거주국에서 구하는 방법을 유지합니다. Sanity 데이터 수정·Studio 배포·Publish는 필요 없습니다.

## 검토용 PR과 Vercel 설정

설치 스크립트는 기존 설치 파일을 재사용할 수 있으면 재사용하고, 제휴 활성화 상태의 로컬 빌드를 확인한 뒤 검토용 PR을 만듭니다. 이 로컬 빌드는 Vercel 설정을 변경하지 않습니다.

1. PR을 생성한 뒤 Vercel에서 이 GitHub 저장소가 연결된 **leckerekoreanischerezepte 프로젝트**를 엽니다.
2. Settings → Environment Variables에서 `AFFILIATE_LINKS_ENABLED`를 찾습니다.
3. 같은 변수가 이미 있으면 값을 `true`로 수정합니다. 없으면 이름 `AFFILIATE_LINKS_ENABLED`, 값 `true`로 추가합니다. Preview와 Production 환경에 적용합니다. 다른 프로젝트의 설정을 바꾸지 않습니다.
4. 저장 후 이 PR의 최신 Preview 배포를 **Redeploy**합니다. 환경 변수 변경은 이미 만들어진 배포에 적용되지 않습니다. 다시 배포할 때 기존 빌드 캐시를 재사용하는 선택지가 있으면 해제합니다.
5. 미리보기의 `/de/ingredients/wheat-flour-type-550`과 `/de/gallery`에서 제품명·Deutschland·`Werbung · Affiliate-Link` 표시를 확인합니다. 제품이 포함된 독일어 레시피에도 같은 표시가 나타납니다. 영어 페이지에는 이 REWE 제휴 링크가 나타나지 않습니다.
6. 공개 표시를 확인한 뒤 merge하면 Production 환경 값으로 새 배포가 만들어집니다. 배포 후 실제 독일 도메인에서도 표시를 확인합니다.

발급된 URL은 Awin 광고주 11652와 Publisher 3113363, 그리고 이 밀가루 제품을 목적지로 포함합니다. 제품은 방문자의 REWE 지점·배송 지역에 따라 이용 가능 여부가 달라질 수 있습니다. 수익은 Awin에서 주문 인정·확정 여부를 확인합니다. 승인이나 클릭 자체를 매출로 계산하지 않습니다.

변수 이름에는 `NEXT_PUBLIC_`를 붙이지 않습니다. 링크는 빌드 시 결정되므로 값을 바꾼 뒤 새 빌드가 필요합니다. 표시가 없으면 최신 배포의 환경 설정과 빌드 로그의 `publication enabled`를 먼저 확인합니다.

## GA4 구매처 클릭 보고서

기존 구매처 필터는 `rewe.de`를 포함하지만, 제휴 링크의 실제 클릭 주소는 `www.awin1.com`이므로 Awin 클릭도 포함해야 합니다. 탐색 **구매처 클릭**에서 현재 **도메인 연결** 필터를 아래 정규식으로 수정합니다. 기존 필터를 클릭해 편집하며 **이벤트 이름 = click** 필터를 유지합니다.

```text
^(www\.)?(rewe\.de|momogo\.de|asiafoodland\.de|handokmall\.de|weee\.com|sayweee\.com|awin1\.com)$
```

표의 링크 URL에는 `awinmid=11652`가 REWE, `awinaffid=3113363`가 본인 Publisher, `ued`가 제품 목적지로 표시됩니다. 나중에 다른 Awin 광고주를 추가하면 도메인만 보고 REWE로 합산하지 말고 광고주 ID와 목적지별로 구분합니다. Awin의 일반 개인정보 안내 링크(`awin.com`)는 이 구매처 필터에 포함하지 않습니다.

GA4는 현재 분석 쿠키에 동의한 방문의 클릭만 수집합니다. Awin의 클릭·주문 보고서와 수집 범위가 다릅니다. 실제 주문·확정 수수료는 Awin에서 별도로 확인합니다. 본인의 확인 클릭은 테스트로 기록하며 운영 성과로 해석하지 않습니다.

## 되돌리기

Vercel에서 `AFFILIATE_LINKS_ENABLED=false`로 수정하고 새로 배포하면 일반 제품 링크로 돌아갑니다. 이 상태에서는 승인된 구매 옵션 카드와 제휴 표시가 나타나지 않습니다. 변수 변경만으로 기존 배포가 바뀌지는 않습니다.

## 확인한 공식 안내

- REWE 프로그램: https://ui.awin.com/merchant-profile/11652
- Link Builder: https://success.awin.com/articles/en_US/Knowledge/How-can-I-use-Link-Builder-to-create-Deep-Links
- Vercel 환경 변수: https://vercel.com/docs/environment-variables
- Awin 개인정보 안내: https://www.awin.com/de/datenschutzerklarung
- 외부 클릭 측정: https://support.google.com/analytics/answer/13566436?hl=en
