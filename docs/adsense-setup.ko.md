# Hansik Young AdSense 신청 준비

2026-10-09 점검. 코드 기준: main `b9adf61`.

## 현재 확인한 상태

영어 `https://www.hansikyoung.com`, 독일어 `https://www.leckere-koreanische-rezepte.de`를 각각 확인했다.

- 두 도메인에서 홈, 미역국 레시피, 재료 목록, 소개, 개인정보 안내, 법적 고지 페이지가 모두 HTTP 200으로 열렸다.
- 홈·대표 레시피·재료·소개 페이지의 HTML 언어와 canonical 주소가 각 도메인에 맞고, noindex 메타 태그가 없었다.
- robots.txt는 전체 경로 수집을 허용한다. 두 sitemap.xml이 각각 HTTP 200으로 열렸고, 각 파일에 95개 URL이 들어 있었다. 이 숫자는 레시피 수나 Google 색인 수가 아니다.
- 대표 레시피는 재료, 분량, 단계, 개인적인 조리 설명을 공개한다. 이번 점검은 모든 레시피의 품질이나 사진 저작권까지 보증하는 전수 검사가 아니다.
- 기존 동의 배너는 Google Analytics와 Microsoft Clarity용이다. 광고용 CMP는 아직 연결되지 않았다.
- 현재 운영 사이트에 AdSense 코드/계정 메타 태그가 없고, 두 /ads.txt는 404였다. 광고를 아직 연결하지 않은 단계이며, 이 사실만으로 신청 불가라고 판단하지 않는다.
- AdSense 계정의 가입·심사·승인 상태와 실제 게시자 번호는 아직 확인하지 않았다.

## 이번 변경

1. 영어 개인정보 안내를 글로벌 독자 대상이라고 명확히 하고, 실제 댓글 버튼 동작에 맞춰 Disqus 설명을 추가한다. Awin 설명은 기존 main에 이미 있다.
2. 실제 게시자 번호를 Vercel 환경 변수 `ADSENSE_PUBLISHER_ID`에 넣으면 서버가 생성하는 HTML head에 `google-adsense-account` 메타 태그를 출력한다. 값은 `ca-pub-`와 숫자 16자리 형식이어야 한다. 빈 값이나 잘못된 형식은 출력하지 않는다.

이 메타 태그는 Google 공식 사이트 연결 방법 중 하나다. 광고 요청, 광고 쿠키, 광고 슬롯을 생성하지 않는다. 기존 방문 분석 동의 처리도 바꾸지 않는다.

## 계정에서 할 순서

1. [AdSense](https://adsense.google.com/start/)를 열고, 기존 AdSense 계정이 있다면 그 계정을 사용한다. GA4와 AdSense는 별도 서비스다.
2. **Sites / 사이트**에서 `hansikyoung.com`과 `leckere-koreanische-rezepte.de`를 추가한다. Vercel 미리보기 주소와 리디렉션 전용 `hansikyoung.de`는 신청 대상으로 사용하지 않는다.
3. 사이트 연결 방법에서 **Meta tag / 메타 태그**를 선택한다. 제공된 태그의 `content="ca-pub-…"` 값을 확인한다.
4. Vercel 프로젝트 → Settings → Environment Variables에서 `ADSENSE_PUBLISHER_ID`를 추가한다. 값은 Google이 준 실제 `ca-pub-…` 문자열이다. Preview와 Production에 적용하고 다시 배포한다. 예시 숫자를 복사하지 않는다.
5. 새 배포의 두 홈페이지 소스에서 해당 메타 태그가 보이는지 확인한다. AdSense에서 **Verify / 확인**, 이어서 **Request review / 검토 요청**을 진행한다. 계정에 다른 필수 입력이 나오면 그 입력도 완료한다.
6. Google이 제공하는 **Privacy & messaging / 개인 정보 보호 및 메시지 → European regulations** 설정을 준비한다. 영어·독일어 사이트에 맞는 메시지와 개인정보 URL을 지정하고, 동의·거절·옵션 관리 선택지를 준비한다. Google CMP는 공식 인증 목록에 있다.

심사 요청과 실제 광고 게재는 별도 단계다. Google은 사이트 승인 전에는 광고를 게재할 수 없다고 안내한다. 승인 여부는 Google이 결정한다. 공식 가입 요건 페이지에는 고정 최소 방문자 수가 제시되어 있지 않다.

## 실제 광고를 켜기 전에 진행할 작업

- Google에서 발급한 정확한 ads.txt 내용을 두 도메인의 루트에서 제공하고 HTTP 상태와 게시자 번호를 확인한다. 이번 PR에는 임의 ads.txt를 넣지 않는다.
- EEA·영국·스위스 방문자에게 개인화 광고를 제공하려면 Google 인증 CMP와 IAB TCF가 필요하다. 인증되지 않은 CMP의 트래픽에도 지원 범위에서 비개인화 또는 제한 광고가 가능할 수 있으므로, 현재 분석 배너를 광고용 인증 CMP로 간주하지 않는다.
- Google 메시지를 실제로 표시하는 코드, 동의 변경 링크, 기존 분석 동의와의 관계를 검토하고 모바일에서 동의·거절 동작을 확인한다. 기존 분석 동의를 광고 동의로 자동 전환하지 않는다.
- 실제 사용하는 광고 서비스와 처리 방식에 맞춰 영어·독일어 개인정보 안내를 갱신한다.
- 레시피 재료·조리 버튼과 구분되는 위치에 광고를 적게 배치하고, 모바일에서 겹침·페이지 이동·속도를 확인한다. 자신의 광고를 클릭하거나 독자에게 클릭을 부탁하지 않는다.

## 공식 근거

- [가입 요건](https://support.google.com/adsense/answer/9724)
- [사이트 연결: 메타 태그·ads.txt·검토 요청](https://support.google.com/adsense/answer/7584263)
- [광고 동의 및 인증 CMP 요건](https://support.google.com/adsense/answer/13554116)
- [Google European regulations 메시지](https://support.google.com/adsense/answer/10961068)

이 문서는 신청과 기술 연결을 위한 작업 기록이다. 현재 매출, 전체 방문자 수, 승인 가능성에 대한 수치 추정은 포함하지 않는다.
