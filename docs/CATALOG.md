# 도구 카탈로그 (백로그)

만들 수 있는 모든 저관여 도구 목록이다. **다음에 무엇을 만들지는 여기서 고른다.** Planner 에이전트는 이 목록에서 GitHub 이슈를 만든다.

- **우선순위**
  - **P0**: 전 세계 검색량이 매우 크고(월 수십만 건 이상으로 추정), 클라이언트로 완벽히 구현할 수 있다.
  - **P1**: 검색량이 크거나, 특정 언어권에서 강하다.
  - **P2**: 롱테일. 도구 수를 늘리는 단계에서 만든다.
- **상태**: `live` · `wip` (이슈 번호) · `todo` · `skip` (이유 기록)
- 검색량은 일반적인 추정이다. 착수 전에 키워드 도구나 검색 결과로 확인한다.
- **새 카테고리**(`device`, `color`, `media`)는 첫 도구를 만들 때 `src/tools/categories.ts`에 추가한다.
- Edge 아이디어는 출발점일 뿐이다. 실제 edge는 착수할 때 경쟁 조사로 확정한다([플레이북 §2](TOOL_PLAYBOOK.md#2-경쟁-조사와-edge-정하기-생략-금지)).

---

## image: 이미지

| slug                  | 도구             | 핵심 키워드 (en / ko)                             | Edge 아이디어                                   | P   | 상태 |
| --------------------- | ---------------- | ------------------------------------------------- | ----------------------------------------------- | --- | ---- |
| image-resizer         | 이미지 크기 조절 | resize image / 이미지 크기 줄이기                 | 업로드 없음, 배치, 채우기+자르기, ZIP           | P0  | live |
| image-compressor      | 이미지 압축      | compress image / 사진 용량 줄이기                 | 목표 용량(KB) 지정 자동 압축, 배치, 업로드 없음 | P0  | live |
| image-converter       | 이미지 형식 변환 | jpg to png, png to jpg, webp to jpg / 이미지 변환 | 모든 조합 하나의 도구 + 조합별 variants         | P0  | live |
| heic-to-jpg           | HEIC → JPG       | heic to jpg / heic jpg 변환                       | 클라이언트 디코딩(libheif wasm 지연 로드), 배치 | P0  | live |
| image-cropper         | 이미지 자르기    | crop image / 사진 자르기                          | 비율 프리셋, 원형 자르기(프로필)                | P0  | live |
| background-remover    | 배경 제거        | remove background / 배경 지우기                   | 온디바이스 ML 모델(지연 로드), 무제한 고해상도  | P1  | todo |
| image-rotate-flip     | 회전·뒤집기      | rotate image / 사진 회전                          | 배치, EXIF 방향 자동 보정                       | P1  | todo |
| image-to-pdf          | 이미지 → PDF     | jpg to pdf / 사진 pdf 변환                        | 순서 드래그, 페이지 크기 맞춤, 업로드 없음      | P0  | live |
| exif-viewer-remover   | EXIF 보기·제거   | remove exif / 사진 위치정보 삭제                  | 지도 미리보기, 배치 제거                        | P1  | todo |
| image-watermark       | 워터마크 넣기    | add watermark / 사진 워터마크                     | 배치, 타일 패턴, 로고 이미지                    | P1  | todo |
| meme-generator        | 밈 만들기        | meme generator / 짤 만들기                        | 워터마크 없음, 한글 폰트                        | P1  | todo |
| collage-maker         | 사진 콜라주      | photo collage / 사진 합치기                       | 레이아웃 템플릿, 고해상도 무료                  | P1  | todo |
| image-upscaler        | 이미지 업스케일  | upscale image / 화질 개선                         | 온디바이스 모델(지연 로드)                      | P2  | todo |
| favicon-generator     | 파비콘 생성      | favicon generator                                 | 모든 사이즈 + manifest + 코드 스니펫            | P1  | todo |
| image-to-base64       | 이미지 → Base64  | image to base64                                   | data URI + CSS/HTML 스니펫                      | P2  | todo |
| svg-to-png            | SVG → PNG        | svg to png                                        | 배율 지정, 투명 배경                            | P2  | todo |
| image-blur-pixelate   | 모자이크·블러    | blur image / 모자이크 처리                        | 영역 선택 모자이크(개인정보 가리기)             | P1  | todo |
| passport-photo        | 증명사진 규격    | passport photo / 여권사진 사이즈                  | 국가별 규격 프리셋, 인화용 배치                 | P1  | todo |
| gif-maker             | GIF 만들기       | gif maker / 움짤 만들기                           | 이미지 → GIF, 프레임 속도                       | P2  | todo |
| screenshot-beautifier | 스크린샷 꾸미기  | screenshot mockup                                 | 그라데이션 배경, 그림자, 브라우저 프레임        | P2  | todo |

## pdf: PDF (pdf-lib, pdf.js를 도구 안에서 지연 로드)

| slug             | 도구             | 핵심 키워드                    | Edge 아이디어                                    | P   | 상태 |
| ---------------- | ---------------- | ------------------------------ | ------------------------------------------------ | --- | ---- |
| merge-pdf        | PDF 합치기       | merge pdf / pdf 합치기         | 업로드 없음(기밀 문서), 드래그 순서 정렬, 무제한 | P0  | live |
| split-pdf        | PDF 나누기       | split pdf / pdf 분할           | 범위 지정, 페이지별 추출, ZIP                    | P0  | live |
| compress-pdf     | PDF 압축         | compress pdf / pdf 용량 줄이기 | 이미지 재압축 수준 선택, 업로드 없음             | P0  | live |
| pdf-to-jpg       | PDF → 이미지     | pdf to jpg / pdf jpg 변환      | 해상도 선택, 페이지 선택, ZIP                    | P0  | live |
| rotate-pdf       | PDF 회전         | rotate pdf                     | 페이지별 회전 썸네일                             | P1  | todo |
| delete-pdf-pages | PDF 페이지 삭제  | delete pages from pdf          | 썸네일 클릭 삭제                                 | P1  | todo |
| reorder-pdf      | PDF 페이지 순서  | rearrange pdf pages            | 드래그 정렬                                      | P1  | todo |
| sign-pdf         | PDF 서명         | sign pdf / pdf 서명            | 손글씨 서명, 업로드 없음                         | P0  | live |
| pdf-page-numbers | 페이지 번호 넣기 | add page numbers to pdf        | 위치, 서식 선택                                  | P2  | todo |
| unlock-pdf       | PDF 암호 제거    | unlock pdf                     | 비밀번호를 아는 파일의 보호 해제                 | P1  | todo |
| protect-pdf      | PDF 암호 설정    | password protect pdf           | 업로드 없음                                      | P1  | todo |
| pdf-to-text      | PDF 텍스트 추출  | pdf to text                    | 페이지별 복사                                    | P2  | todo |
| watermark-pdf    | PDF 워터마크     | watermark pdf                  | 텍스트, 이미지, 투명도                           | P2  | todo |

## text: 텍스트

| slug                   | 도구              | 핵심 키워드                          | Edge 아이디어                                         | P   | 상태 |
| ---------------------- | ----------------- | ------------------------------------ | ----------------------------------------------------- | --- | ---- |
| word-counter           | 글자수 세기       | word counter / 글자수 세기           | CJK 정확, 2byte/UTF-8, 제한 추적, 광고 없음           | P0  | live |
| case-converter         | 대소문자 변환     | case converter / 대소문자 변환       | Title Case 규칙(AP/Chicago), camelCase 등 개발 케이스 | P0  | live |
| remove-line-breaks     | 줄바꿈 제거       | remove line breaks / 줄바꿈 없애기   | PDF 복사 텍스트 정리 모드                             | P1  | todo |
| remove-duplicate-lines | 중복 줄 제거      | remove duplicate lines               | 정렬, 공백 무시 옵션                                  | P1  | todo |
| text-diff              | 텍스트 비교       | text compare / 텍스트 비교           | 단어·글자 단위 diff, 한글 자모 정확                   | P0  | live |
| sort-lines             | 줄 정렬           | sort lines alphabetically            | 자연 정렬, 한글 가나다순, 역순, 셔플                  | P2  | todo |
| find-and-replace       | 찾아 바꾸기       | find and replace text                | 정규식, 대소문자 옵션                                 | P2  | todo |
| lorem-ipsum            | 더미 텍스트       | lorem ipsum generator / 더미 텍스트  | 한국어 더미 텍스트                                    | P1  | todo |
| korean-spell-check     | 맞춤법 검사       | 맞춤법 검사기                        | (서버 필요 시 skip 검토)                              | P1  | todo |
| hangul-romanization    | 한글 로마자 변환  | 한글 영문 변환 / korean romanization | 국립국어원 표기법 + 여권 이름 표기                    | P1  | todo |
| text-to-speech         | 텍스트 읽어주기   | text to speech                       | Web Speech API, 다국어 음성                           | P1  | todo |
| speech-to-text         | 받아쓰기          | speech to text / 음성 텍스트 변환    | Web Speech API                                        | P1  | todo |
| fancy-text             | 특수 폰트 텍스트  | fancy text generator                 | 인스타 바이오용 유니코드 서체                         | P1  | todo |
| invisible-character    | 공백 문자         | invisible character / 투명 문자      | 복사 한 번, 플랫폼별 동작 안내                        | P1  | todo |
| reverse-text           | 텍스트 뒤집기     | reverse text                         | 거꾸로, 상하 뒤집기                                   | P2  | todo |
| word-frequency         | 단어 빈도         | word frequency counter               | CJK 분절, CSV 내보내기                                | P2  | todo |
| markdown-editor        | 마크다운 미리보기 | markdown editor online               | 실시간 미리보기, HTML 복사                            | P2  | todo |
| character-map          | 특수문자표        | special characters / 특수문자        | 한국어 키보드 특수문자(ㅁ+한자) 카테고리              | P1  | todo |

## time: 시간·날짜

| slug                | 도구              | 핵심 키워드                       | Edge 아이디어                                       | P   | 상태 |
| ------------------- | ----------------- | --------------------------------- | --------------------------------------------------- | --- | ---- |
| timer               | 타이머            | timer, 5 minute timer / 타이머    | 백그라운드 정확, 새로고침 유지, 단축키, variants    | P0  | live |
| stopwatch           | 스톱워치          | stopwatch / 스톱워치              | 랩 기록 CSV, 밀리초, 새로고침 유지                  | P0  | live |
| pomodoro-timer      | 뽀모도로          | pomodoro timer / 뽀모도로         | 세션 기록, 작업 목록, 알림                          | P0  | live |
| countdown           | 디데이 카운트다운 | countdown to date / 디데이 계산기 | 공유 링크(URL 파라미터), 이벤트 프리셋              | P0  | live |
| alarm-clock         | 온라인 알람       | online alarm clock / 알람         | 탭 유지 알람, 여러 알람                             | P1  | todo |
| world-clock         | 세계 시계         | world clock / 세계 시간           | 회의 시간 플래너(시간대 겹침)                       | P1  | todo |
| time-zone-converter | 시간대 변환       | time zone converter / 시차 계산   | 도시 검색, DST 정확                                 | P0  | todo |
| date-calculator     | 날짜 계산기       | date calculator / 날짜 계산       | 영업일 계산, 국가별 공휴일                          | P0  | live |
| age-calculator      | 나이 계산기       | age calculator / 만 나이 계산기   | 한국 만 나이, 띠, 별자리                            | P0  | todo |
| unix-timestamp      | 타임스탬프 변환   | unix timestamp converter          | 밀리초/초 자동 인식, 시간대                         | P1  | todo |
| hours-calculator    | 근무 시간 계산    | hours calculator / 근무시간 계산  | 휴게 시간 차감, 주간 합계                           | P1  | todo |
| online-clock        | 온라인 시계       | online clock / 현재 시간          | 전체화면 대형 시계, 서버 시간 동기화 없이 오차 표시 | P1  | todo |
| interval-timer      | 인터벌 타이머     | tabata timer / 인터벌 타이머      | 운동 프리셋, 음성 안내                              | P1  | todo |
| metronome           | 메트로놈          | metronome / 메트로놈              | Web Audio 정확한 박자, 탭 템포                      | P1  | todo |
| week-number         | 주차 계산         | what week is it / 몇 주차         | ISO 주차, 연간 달력                                 | P2  | todo |

## calculator: 계산기

| slug                    | 도구             | 핵심 키워드                                | Edge 아이디어                           | P   | 상태 |
| ----------------------- | ---------------- | ------------------------------------------ | --------------------------------------- | --- | ---- |
| percentage-calculator   | 퍼센트 계산기    | percentage calculator / 퍼센트 계산        | 4가지 유형 동시 표시, 계산식 노출       | P0  | todo |
| scientific-calculator   | 공학용 계산기    | scientific calculator / 공학용 계산기      | 키보드 입력, 히스토리                   | P0  | todo |
| bmi-calculator          | BMI 계산기       | bmi calculator / bmi 계산                  | 아시아 기준(대한비만학회) 병기          | P0  | todo |
| loan-calculator         | 대출 이자 계산기 | loan calculator / 대출 이자 계산기         | 원리금균등, 원금균등, 만기일시, 상환표  | P0  | todo |
| salary-calculator-kr    | 연봉 실수령액    | 연봉 실수령액 계산기                       | 2026년 4대보험 요율, 비과세 반영        | P0  | todo |
| compound-interest       | 복리 계산기      | compound interest calculator / 복리 계산기 | 적립식, 그래프                          | P0  | todo |
| tip-calculator          | 팁 계산기        | tip calculator                             | 인원 분할, 국가별 팁 관행               | P1  | todo |
| discount-calculator     | 할인율 계산기    | discount calculator / 할인율 계산          | 중복 할인, 원가 역산                    | P1  | todo |
| gpa-calculator          | 학점 계산기      | gpa calculator / 학점 계산기               | 4.5/4.3/4.0 환산                        | P1  | todo |
| fraction-calculator     | 분수 계산기      | fraction calculator                        | 풀이 과정 표시                          | P1  | todo |
| random-number           | 랜덤 숫자        | random number generator                    | 중복 없음, 범위, 대량                   | P0  | todo |
| calorie-calculator      | 칼로리 계산기    | calorie calculator / 기초대사량            | Mifflin-St Jeor 공식 명시               | P1  | todo |
| pregnancy-calculator    | 출산 예정일      | due date calculator / 출산예정일           | 주차별 정보                             | P1  | todo |
| vat-calculator          | 부가세 계산기    | vat calculator / 부가세 계산기             | 국가별 세율, 역산                       | P1  | todo |
| severance-pay-kr        | 퇴직금 계산기    | 퇴직금 계산기                              | 평균임금 자동 계산                      | P1  | todo |
| unemployment-benefit-kr | 실업급여 계산기  | 실업급여 계산기                            | 2026년 상하한액                         | P1  | todo |
| pyeong-calculator       | 평수 계산기      | 평수 계산 / 평 제곱미터                    | 공급·전용 면적 설명                     | P1  | todo |
| ratio-calculator        | 비율 계산기      | ratio calculator / 비례식 계산             | 화면비, 레시피 비율                     | P2  | todo |
| average-calculator      | 평균 계산기      | average calculator                         | 평균, 중앙값, 최빈값, 표준편차 한번에   | P2  | todo |
| electricity-bill-kr     | 전기요금 계산기  | 전기요금 계산기                            | 누진 구간 시각화                        | P2  | todo |
| exchange-rate           | 환율 계산기      | currency converter / 환율 계산기           | (환율 데이터 필요: 빌드 타임 갱신 검토) | P1  | todo |

## converter: 단위 변환

단위 변환은 **도구 1개 + 단위 쌍 variants**로 롱테일을 공략한다(예: `/length-converter/cm-to-inches`).

| slug                    | 도구           | 핵심 키워드                                 | Edge 아이디어                 | P   | 상태 |
| ----------------------- | -------------- | ------------------------------------------- | ----------------------------- | --- | ---- |
| length-converter        | 길이 변환      | cm to inches, feet to meters / cm 인치 변환 | 키(ft'in") 입력, 빠른 표      | P0  | todo |
| weight-converter        | 무게 변환      | kg to lbs / kg 파운드                       | 근, 돈 등 한국 단위           | P0  | todo |
| temperature-converter   | 온도 변환      | celsius to fahrenheit / 섭씨 화씨           | 요리 온도 표                  | P0  | todo |
| area-converter          | 넓이 변환      | sq ft to m2 / 평 계산                       | 평 ↔ ㎡ 강조                  | P1  | todo |
| volume-converter        | 부피 변환      | cups to ml / 컵 ml                          | 요리 계량 (US/메트릭 컵 구분) | P1  | todo |
| speed-converter         | 속도 변환      | mph to kmh                                  | 페이스(분/km) 변환            | P1  | todo |
| data-size-converter     | 데이터 크기    | mb to gb / 용량 변환                        | 1000 vs 1024 둘 다 표시       | P1  | todo |
| shoe-size-converter     | 신발 사이즈    | shoe size conversion / 신발 사이즈 표       | 브랜드별 차이 안내            | P1  | todo |
| clothing-size-converter | 옷 사이즈      | clothing size chart / 옷 사이즈 변환        | 국가별 표                     | P2  | todo |
| number-base-converter   | 진법 변환      | binary to decimal / 진법 변환               | 실시간 다중 진법              | P1  | todo |
| roman-numerals          | 로마 숫자      | roman numeral converter                     | 양방향 + 규칙 설명            | P2  | todo |
| korean-number           | 숫자 한글 변환 | 숫자 한글 변환 / 금액 한글                  | 수표·계약서용 "일금 ○○원정"   | P1  | todo |
| cooking-converter       | 요리 계량      | tablespoon to grams                         | 재료별 밀도                   | P2  | todo |
| pressure-converter      | 압력 변환      | psi to bar                                  | 타이어 압력 표                | P2  | todo |
| energy-converter        | 에너지 변환    | kcal to kj                                  | —                             | P2  | todo |

## developer: 개발자 도구

| slug              | 도구             | 핵심 키워드                                | Edge 아이디어                        | P   | 상태 |
| ----------------- | ---------------- | ------------------------------------------ | ------------------------------------ | --- | ---- |
| json-formatter    | JSON 포맷터      | json formatter / json 정렬                 | 트리 뷰, 오류 위치 표시, 대용량 성능 | P0  | todo |
| base64            | Base64 인코딩    | base64 decode / base64 변환                | 파일 지원, URL-safe                  | P0  | todo |
| url-encoder       | URL 인코딩       | url encode decode                          | 쿼리 파라미터 표 분해                | P1  | todo |
| uuid-generator    | UUID 생성        | uuid generator                             | v4/v7, 대량, 형식 옵션               | P1  | todo |
| hash-generator    | 해시 생성        | sha256 generator / md5                     | 파일 해시, Web Crypto                | P1  | todo |
| jwt-decoder       | JWT 디코더       | jwt decode                                 | 만료 시간 사람이 읽는 형태로         | P1  | todo |
| regex-tester      | 정규식 테스트    | regex tester                               | 매치 하이라이트, 설명                | P1  | todo |
| diff-checker-code | 코드 비교        | diff checker                               | 구문 하이라이트 diff                 | P2  | todo |
| cron-parser       | Cron 해석        | cron expression                            | 다음 실행 시각 목록                  | P2  | todo |
| color-converter   | 색상 변환        | hex to rgb                                 | OKLCH 포함, 대비율                   | P1  | todo |
| css-minifier      | CSS/JS 압축      | minify css                                 | —                                    | P2  | todo |
| sql-formatter     | SQL 포맷터       | sql formatter                              | 방언 선택                            | P2  | todo |
| yaml-json         | YAML ↔ JSON      | yaml to json                               | 양방향                               | P2  | todo |
| csv-json          | CSV ↔ JSON       | csv to json                                | 미리보기 표                          | P1  | todo |
| html-entities     | HTML 엔티티      | html encode                                | —                                    | P2  | todo |
| user-agent        | 내 브라우저 정보 | what is my browser / user agent            | 해석된 정보 + 복사                   | P2  | todo |
| screen-resolution | 화면 해상도 확인 | what is my screen resolution / 해상도 확인 | DPR, 뷰포트 함께                     | P1  | todo |

## generator: 생성기

| slug                | 도구           | 핵심 키워드                          | Edge 아이디어                                     | P   | 상태 |
| ------------------- | -------------- | ------------------------------------ | ------------------------------------------------- | --- | ---- |
| qr-code-generator   | QR 코드 생성   | qr code generator / qr코드 만들기    | 만료 없음(정적 QR), 로고 삽입, SVG, 워터마크 없음 | P0  | todo |
| password-generator  | 비밀번호 생성  | password generator / 비밀번호 생성기 | 엔트로피 표시, 외우기 쉬운 단어 조합              | P0  | todo |
| qr-code-scanner     | QR 코드 스캐너 | qr code scanner online               | 카메라, 이미지 파일                               | P1  | todo |
| barcode-generator   | 바코드 생성    | barcode generator                    | EAN, Code128, SVG                                 | P1  | todo |
| random-picker       | 랜덤 뽑기      | random name picker / 제비뽑기        | 룰렛 애니메이션, 결과 공유                        | P0  | todo |
| team-generator      | 팀 나누기      | random team generator / 팀 나누기    | 실력 밸런스 옵션                                  | P1  | todo |
| dice-roller         | 주사위         | roll dice / 주사위 굴리기            | 여러 개, D&D 다면체                               | P1  | todo |
| coin-flip           | 동전 던지기    | flip a coin / 동전 던지기            | 통계 누적                                         | P1  | todo |
| spin-wheel          | 돌림판         | spin the wheel / 돌림판              | 항목 저장, 전체화면                               | P0  | todo |
| ladder-game         | 사다리 타기    | 사다리 타기                          | 애니메이션, 결과 공유                             | P1  | todo |
| lotto-generator     | 로또 번호      | 로또 번호 생성기                     | 제외수, 고정수                                    | P1  | todo |
| username-generator  | 닉네임 생성    | username generator / 닉네임 추천     | 한글 닉네임                                       | P2  | todo |
| signature-generator | 서명 만들기    | signature generator / 서명 만들기    | 손글씨, 폰트 서명, 투명 PNG                       | P1  | todo |

## device: 기기 테스트 (신규 카테고리)

검색량이 매우 크고, 브라우저 API로 100% 구현할 수 있으며, 광고가 많은 경쟁 사이트가 대부분이다.

| slug               | 도구            | 핵심 키워드                          | Edge 아이디어                   | P   | 상태 |
| ------------------ | --------------- | ------------------------------------ | ------------------------------- | --- | ---- |
| mic-test           | 마이크 테스트   | mic test / 마이크 테스트             | 레벨 미터, 녹음 재생, 장치 선택 | P0  | todo |
| webcam-test        | 웹캠 테스트     | webcam test / 웹캠 테스트            | 해상도, FPS 표시, 스냅샷        | P0  | todo |
| keyboard-tester    | 키보드 테스트   | keyboard test / 키보드 테스트        | 레이아웃 선택, 동시 입력(NKRO)  | P0  | todo |
| mouse-test         | 마우스 테스트   | mouse test / 더블클릭 테스트         | 더블클릭 오작동 감지            | P1  | todo |
| dead-pixel-test    | 불량화소 테스트 | dead pixel test / 불량화소           | 전체화면 색 순환                | P1  | todo |
| speaker-test       | 스피커 테스트   | speaker test / 좌우 스피커 테스트    | 좌우, 주파수 스윕               | P1  | todo |
| typing-test        | 타자 연습       | typing test / 타자 연습              | 한글 타수, 영문 WPM             | P0  | todo |
| refresh-rate-test  | 주사율 테스트   | refresh rate test / hz 확인          | —                               | P2  | todo |
| click-speed-test   | 클릭 속도       | cps test                             | —                               | P1  | todo |
| reaction-time-test | 반응속도        | reaction time test / 반응속도 테스트 | 평균, 백분위                    | P1  | todo |

## color: 색상·디자인 (신규 카테고리)

| slug               | 도구        | 핵심 키워드             | Edge 아이디어           | P   | 상태 |
| ------------------ | ----------- | ----------------------- | ----------------------- | --- | ---- |
| color-picker       | 색상 추출   | color picker from image | 이미지에서 추출, 팔레트 | P1  | todo |
| contrast-checker   | 명도 대비   | contrast checker        | WCAG 2 + APCA           | P1  | todo |
| gradient-generator | 그라데이션  | css gradient generator  | OKLCH 보간              | P2  | todo |
| palette-generator  | 팔레트 생성 | color palette generator | 접근성 검증 포함        | P2  | todo |

## media: 오디오·비디오 (신규 카테고리, ffmpeg.wasm 지연 로드, JS 예산 예외 검토)

| slug             | 도구          | 핵심 키워드                         | Edge 아이디어            | P   | 상태 |
| ---------------- | ------------- | ----------------------------------- | ------------------------ | --- | ---- |
| video-to-gif     | 동영상 → GIF  | video to gif                        | 업로드 없음              | P1  | todo |
| video-compressor | 동영상 압축   | compress video / 동영상 용량 줄이기 | 업로드 없음(대용량 강점) | P1  | todo |
| audio-converter  | 오디오 변환   | mp3 converter                       | —                        | P2  | todo |
| audio-cutter     | 오디오 자르기 | mp3 cutter / 벨소리 만들기          | 파형 편집                | P1  | todo |
| voice-recorder   | 음성 녹음     | online voice recorder / 녹음기      | 업로드 없음, mp3 저장    | P1  | todo |
| screen-recorder  | 화면 녹화     | screen recorder online / 화면 녹화  | 설치 없음, 워터마크 없음 | P1  | todo |
