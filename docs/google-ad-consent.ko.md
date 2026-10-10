# Google 광고 동의 메시지 연결

이 변경은 이미 게시한 AdSense의 유럽 규정 메시지를 사이트에서 불러오는 준비입니다. 계정 인증 메타 태그와 ads.txt는 기존 것을 사용합니다. Sanity 배포나 콘텐츠 Publish는 필요 없습니다.

## 켜기 전 확인

- 두 사이트의 기존 메시지는 Published 상태여야 합니다. 새 메시지를 만들지 않습니다.
- 영어 사이트 개인정보 주소는 `https://www.hansikyoung.com/privacy-policy`, 독일어는 `https://www.leckere-koreanische-rezepte.de/datenschutzerklaerung`입니다.
- Consent / Do not consent / Manage options 세 가지 선택을 유지합니다.
- AdSense → Ads에서 두 사이트의 Auto ads는 현재 꺼 둔 상태를 유지합니다. 이 PR은 수동 광고 단위를 만들거나 Auto ads 설정을 바꾸지 않습니다. 이미 Auto ads가 켜져 있는 사이트에 이 코드를 활성화하면 광고가 게재될 수 있습니다.
- Privacy & messaging의 Consent mode 설정은 같은 계정의 다른 사이트에도 영향을 줍니다. Schulferienklar를 포함한 전역 설정을 이번 작업 때문에 바꾸지 않습니다. Google Analytics와 Clarity는 기존 분석 배너에서 허용한 경우에만 로드하며, 광고 선택이 그 분석 허용을 대신하지 않습니다. Google의 설정은 Google Analytics 동작에 추가 제한을 줄 수 있습니다.

## 검토와 적용

기본값은 꺼짐입니다. 기존 `ADSENSE_PUBLISHER_ID=ca-pub-8336348698974993`은 그대로 유지합니다.

1. 먼저 PR에서 코드와 영어·독일어 개인정보 문구를 검토합니다. Preview 주소는 Google에 등록한 운영 도메인이 아니므로 그 주소에서 운영 메시지가 나오지 않는 것만으로 실패라고 판단하지 않습니다.
2. 검토 후 merge합니다. 이때 아래 변수가 없거나 false이면 Google 광고 스크립트는 여전히 로드하지 않습니다.
3. Vercel 프로젝트 `leckerekoreanischerezepte` → Environment Variables → Add에서 이름 `NEXT_PUBLIC_ADSENSE_ENABLED`, 값 `true`를 추가합니다. Production에 적용합니다. Preview 테스트가 필요한 경우에만 Preview에도 적용합니다.
4. Production을 Redeploy합니다. 설정은 빌드 때 반영됩니다. 이전 빌드 캐시를 사용하지 않고 새로 배포합니다.
5. 두 운영 도메인을 각각 시크릿 창에서 엽니다. 독일에서 처음 방문하는 경우 해당 도메인의 게시된 Google 메시지가 표시되는지 확인합니다. 기존 방문 기록 때문에 나오지 않으면 아래 디버그 주소를 사용합니다.

영어: `https://www.hansikyoung.com/?fc=alwaysshow&fctype=gdpr`

독일어: `https://www.leckere-koreanische-rezepte.de/?fc=alwaysshow&fctype=gdpr`

디버그 주소는 테스트용이며 공유 링크로 사용하지 않습니다.

## 방문자 확인

- Google 메시지에서 거부해도 레시피를 계속 볼 수 있어야 합니다.
- 광고 동의와 별도로 기존 분석 배너는 “Allow analytics / Decline analytics” 또는 “Analyse erlauben / Analyse ablehnen”라고 표시됩니다. 분석을 거부한 방문에서 GA와 Clarity를 로드하지 않습니다.
- Google 서비스가 준비되고 유럽 규정이 적용되는 방문자의 Footer에 “Advertising privacy settings / Datenschutzeinstellungen für Werbung” 버튼이 표시됩니다. 버튼을 눌러 광고 선택을 다시 열 수 있어야 합니다. 광고 차단 등으로 API를 사용할 수 없으면 작동하지 않는 버튼을 표시하지 않습니다.
- Footer의 Privacy Policy / Datenschutz 링크는 전체 페이지를 새로 열어 이전 페이지의 광고 스크립트를 남기지 않습니다. 두 개인정보 페이지 자체에는 광고 로더, Google 분석, Clarity, Instagram 임베드 스크립트를 넣지 않습니다.
- 메시지 노출과 사이트 광고 승인은 별개입니다. Sites 상태가 Ready인지 따로 확인합니다. 광고를 실제로 넣는 위치와 형식은 승인 및 메시지 확인 후 별도 작업에서 결정합니다.
- 문제가 있으면 `NEXT_PUBLIC_ADSENSE_ENABLED=false`로 수정하고 Production을 다시 배포합니다. 메타 태그와 ads.txt는 유지됩니다.

## 검증

`node --test tests/google-advertising.test.cjs`

`npm run check:clarity`

검증은 기능 기본 꺼짐, 잘못된 게시자 ID 차단, 두 개인정보 경로 제외, 광고 태그 중복 방지, API 준비 전 버튼 숨김, TCF 적용 여부, 늦게 도착하는 콜백 정리, 지원되는 큐를 통한 메시지 재열기를 다룹니다. 실제 Google의 메시지 언어·표시와 계정 승인은 운영 도메인에서 별도로 확인해야 합니다.

공식 문서:

- https://developers.google.com/funding-choices/fc-api-docs
- https://support.google.com/adsense/answer/10961370
- https://support.google.com/adsense/answer/16053245
