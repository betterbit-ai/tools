# 도구 카탈로그 (백로그)

만들 수 있는 모든 저관여 도구 목록이다. **다음에 무엇을 만들지는 여기서 고른다.** Planner 에이전트는 이 목록에서 GitHub 이슈를 만든다.

- **우선순위**
  - **P0**: 전 세계 검색량이 매우 크고(월 수십만 건 이상으로 추정), 클라이언트로 완벽히 구현할 수 있다.
  - **P1**: 검색량이 크거나, 특정 언어권에서 강하다.
  - **P2**: 롱테일. 도구 수를 늘리는 단계에서 만든다.
- **상태**: `live` · `wip` (이슈 번호) · `todo` · `skip` (이유 기록)
- 검색량은 일반적인 추정이다. 착수 전에 키워드 도구나 검색 결과로 확인한다.
- **새 카테고리**(`device`, `color`, `media`)는 첫 도구를 만들 때 `src/tools/categories.ts`에 추가한다.
- **고르는 기준 (2026-10-21 추가, 가장 중요)**: 검색 노출은 늘었는데 클릭이 거의 없었다. 노출된 검색어 대부분("mph to kmh", "1 minute timer")은 구글이 검색 결과 맨 위에 자체 계산기·타이머를 띄워 사용자가 클릭하지 않는 검색어였다. 그래서 새 도구는 아래 중 하나 이상에 해당해야 한다.
  1. **구글 위젯이 없다**: 착수 전에 대표 검색어를 구글에 직접 쳐 보고, 검색 결과 위에 구글 자체 도구(단위 변환, 타이머, 계산기, 색상 선택, 메트로놈, 동전 던지기 등)가 뜨면 만들지 않거나 P2로 내린다.
  2. **파일·기기가 필요하다**: 파일을 넣거나(이미지·PDF·오디오·동영상) 마이크·카메라를 써야 해서 검색 결과 안에서 끝날 수 없는 작업.
  3. **한국 특화**: 한국 제도·관습 계산(주휴수당, 연차, 4대보험, 음력, 평 등). 구글은 약하고 네이버 상위는 오래된 광고 많은 사이트가 많다.
  4. **롱테일**: 큰 검색어 대신 구체적인 상황 검색어("오븐 가스 마크 표", "사진 날짜 유지 HEIC 변환").
- Edge 아이디어는 출발점일 뿐이다. 실제 edge는 착수할 때 경쟁 조사로 확정한다([플레이북 §2](TOOL_PLAYBOOK.md#2-경쟁-조사와-edge-정하기-생략-금지)).

---

## image: 이미지

| slug                  | 도구                   | 핵심 키워드 (en / ko)                                          | Edge 아이디어                                                                             | P   | 상태 |
| --------------------- | ---------------------- | -------------------------------------------------------------- | ----------------------------------------------------------------------------------------- | --- | ---- |
| image-resizer         | 이미지 크기 조절       | resize image / 이미지 크기 줄이기                              | 업로드 없음, 배치, 채우기+자르기, ZIP                                                     | P0  | live |
| image-compressor      | 이미지 압축            | compress image / 사진 용량 줄이기                              | 목표 용량(KB) 지정 자동 압축, 배치, 업로드 없음                                           | P0  | live |
| image-converter       | 이미지 형식 변환       | jpg to png, png to jpg, webp to jpg / 이미지 변환              | 모든 조합 하나의 도구 + 조합별 variants                                                   | P0  | live |
| heic-to-jpg           | HEIC → JPG             | heic to jpg / heic jpg 변환                                    | 클라이언트 디코딩(libheif wasm 지연 로드), 배치                                           | P0  | live |
| image-cropper         | 이미지 자르기          | crop image / 사진 자르기                                       | 비율 프리셋, 원형 자르기(프로필)                                                          | P0  | live |
| background-remover    | 배경 제거              | remove background / 배경 지우기                                | 온디바이스 ML 모델(지연 로드), 원본 크기 PNG                                              | P1  | live |
| image-rotate-flip     | 회전·뒤집기            | rotate image / 사진 회전                                       | 배치, EXIF 방향 자동 보정                                                                 | P1  | live |
| image-to-pdf          | 이미지 → PDF           | jpg to pdf / 사진 pdf 변환                                     | 순서 드래그, 페이지 크기 맞춤, 업로드 없음                                                | P0  | live |
| exif-viewer-remover   | EXIF 보기·제거         | remove exif / 사진 위치정보 삭제                               | 검사 후 배치 제거, ZIP 다운로드                                                           | P1  | live |
| image-watermark       | 워터마크 넣기          | add watermark / 사진 워터마크                                  | 배치, 타일 패턴, 로고 이미지                                                              | P1  | live |
| meme-generator        | 밈 만들기              | meme generator / 짤 만들기                                     | 워터마크 없음, 한글 폰트                                                                  | P1  | live |
| collage-maker         | 사진 콜라주            | photo collage / 사진 합치기                                    | 레이아웃 템플릿, 고해상도 무료                                                            | P1  | live |
| image-upscaler        | 이미지 업스케일        | upscale image / 사진 화질 개선                                 | 온디바이스 AI 모델(지연 로드), 2×·4× 비교                                                 | P0  | live |
| favicon-generator     | 파비콘 생성            | favicon generator                                              | 모든 사이즈 + manifest + 코드 스니펫                                                      | P1  | live |
| image-to-base64       | 이미지 → Base64        | image to base64                                                | data URI + CSS/HTML 스니펫                                                                | P2  | live |
| svg-to-png            | SVG → PNG              | svg to png                                                     | 배율 지정, 투명 배경                                                                      | P2  | live |
| image-blur-pixelate   | 모자이크·블러          | blur image / 모자이크 처리                                     | 영역 선택 모자이크(개인정보 가리기)                                                       | P1  | live |
| passport-photo        | 증명사진 규격          | passport photo / 여권사진 사이즈                               | 국가별 규격 프리셋, 인화용 배치                                                           | P1  | live |
| gif-maker             | GIF 만들기             | gif maker / 움짤 만들기                                        | 이미지 → GIF, 프레임 속도                                                                 | P2  | live |
| screenshot-beautifier | 스크린샷 꾸미기        | screenshot mockup                                              | 그라데이션 배경, 그림자, 브라우저 프레임                                                  | P2  | live |
| image-to-text         | 이미지 글자 추출 (OCR) | image to text, ocr online / 사진 글자 추출, 이미지 텍스트 변환 | 업로드 없는 온디바이스 OCR(wasm·언어 데이터 지연 로드, 자체 호스팅), 한글+영어, 복사·.txt | P1  | live |

| image-splitter | 이미지 분할 | split image into grid / 사진 분할, 인스타 그리드 만들기 | 격자·정확한 픽셀·Instagram 비율 프리셋, 분할본 ZIP | P1 | todo |
| contact-sheet-maker | 연락처 시트 만들기 | contact sheet maker / 사진 컨택트 시트 | 폴더 사진을 번호·파일명과 함께 한 장의 인쇄용 PDF/PNG로, 업로드 없음 | P2 | todo |
| image-dpi-changer | 이미지 DPI 변경 | change image dpi / 사진 DPI 변경, 인쇄 해상도 변경 | 픽셀은 보존하고 72·150·300 DPI와 인쇄 크기를 함께 미리보기 | P1 | todo |
| photo-date-stamper | 사진 날짜 넣기 | add date stamp to photo / 사진 날짜 넣기 | EXIF 촬영일 자동 읽기, 위치·서식 일괄 적용, 원본 메타데이터 유지 선택 | P2 | todo |
| gif-frame-extractor | GIF 프레임 추출 | extract frames from gif / GIF 프레임 추출 | 프레임별 PNG/WebP, 지연 시간 목록, 선택 프레임만 ZIP | P2 | todo |
| sprite-sheet-generator | 스프라이트 시트 만들기 | sprite sheet generator / 스프라이트 시트 만들기 | 이미지 순서를 유지한 시트 PNG와 CSS/JSON 좌표를 함께 생성 | P2 | todo |

## pdf: PDF (pdf-lib, pdf.js를 도구 안에서 지연 로드)

| slug             | 도구             | 핵심 키워드                    | Edge 아이디어                                    | P   | 상태 |
| ---------------- | ---------------- | ------------------------------ | ------------------------------------------------ | --- | ---- |
| merge-pdf        | PDF 합치기       | merge pdf / pdf 합치기         | 업로드 없음(기밀 문서), 드래그 순서 정렬, 무제한 | P0  | live |
| split-pdf        | PDF 나누기       | split pdf / pdf 분할           | 범위 지정, 페이지별 추출, ZIP                    | P0  | live |
| compress-pdf     | PDF 압축         | compress pdf / pdf 용량 줄이기 | 이미지 재압축 수준 선택, 업로드 없음             | P0  | live |
| pdf-to-jpg       | PDF → 이미지     | pdf to jpg / pdf jpg 변환      | 해상도 선택, 페이지 선택, ZIP                    | P0  | live |
| rotate-pdf       | PDF 회전         | rotate pdf                     | 페이지별 회전 썸네일                             | P1  | live |
| delete-pdf-pages | PDF 페이지 삭제  | delete pages from pdf          | 썸네일 클릭 삭제                                 | P1  | live |
| reorder-pdf      | PDF 페이지 순서  | rearrange pdf pages            | 드래그 정렬                                      | P1  | live |
| sign-pdf         | PDF 서명         | sign pdf / pdf 서명            | 손글씨 서명, 업로드 없음                         | P0  | live |
| pdf-page-numbers | 페이지 번호 넣기 | add page numbers to pdf        | 위치, 서식 선택                                  | P1  | live |
| unlock-pdf       | PDF 암호 제거    | unlock pdf                     | 비밀번호를 아는 파일의 보호 해제                 | P1  | live |
| protect-pdf      | PDF 암호 설정    | password protect pdf           | 업로드 없음                                      | P1  | live |
| pdf-to-text      | PDF 텍스트 추출  | pdf to text                    | 페이지별 복사                                    | P1  | live |
| watermark-pdf    | PDF 워터마크     | watermark pdf                  | 텍스트, 이미지, 투명도                           | P1  | live |

| pdf-crop | PDF 여백 자르기 | crop pdf / PDF 여백 자르기 | 페이지별 미리보기에서 영역 지정, 모든 페이지 적용, 파일 업로드 없음 | P1 | todo |
| pdf-page-size | PDF 용지 크기 변경 | resize pdf pages / PDF A4 변환 | A4·Letter·B5 프리셋과 맞춤/자르기 차이를 미리보기로 명확히 표시 | P1 | todo |
| pdf-booklet | PDF 소책자 만들기 | pdf booklet maker / PDF 책자 인쇄 | 양면 인쇄용 페이지 재배치, 제본 방향·빈 페이지 자동 보완 | P2 | todo |
| pdf-n-up | PDF 모아찍기 | pdf n-up / PDF 모아찍기 | 2·4·6·9쪽 인쇄 레이아웃, 여백·테두리·용지 방향 선택 | P2 | todo |
| pdf-extract-images | PDF 이미지 추출 | extract images from pdf / PDF 이미지 추출 | 원본 내장 이미지와 페이지 렌더링을 구분해 선택, 원본명 유지 ZIP | P1 | todo |
| pdf-metadata-remover | PDF 메타데이터 삭제 | remove pdf metadata / PDF 개인정보 삭제 | 제목·작성자·생성 도구를 검사 후 한 번에 삭제, 결과 전후 비교 | P1 | todo |
| pdf-form-filler | PDF 양식 작성 | fill pdf form / PDF 양식 작성 | AcroForm 필드 자동 인식, 입력값은 로컬 저장, 평면화 사본 선택 | P1 | todo |
| pdf-to-png | PDF → PNG | pdf to png / PDF PNG 변환 | 투명 배경·해상도·페이지 선택, 여러 페이지는 ZIP | P1 | todo |

## text: 텍스트

| slug                   | 도구              | 핵심 키워드                          | Edge 아이디어                                         | P   | 상태 |
| ---------------------- | ----------------- | ------------------------------------ | ----------------------------------------------------- | --- | ---- |
| word-counter           | 글자수 세기       | word counter / 글자수 세기           | CJK 정확, 2byte/UTF-8, 제한 추적                      | P0  | live |
| case-converter         | 대소문자 변환     | case converter / 대소문자 변환       | Title Case 규칙(AP/Chicago), camelCase 등 개발 케이스 | P0  | live |
| remove-line-breaks     | 줄바꿈 제거       | remove line breaks / 줄바꿈 없애기   | PDF 복사 텍스트 정리 모드                             | P1  | live |
| remove-duplicate-lines | 중복 줄 제거      | remove duplicate lines               | 정렬, 공백 무시 옵션                                  | P1  | live |
| text-diff              | 텍스트 비교       | text compare / 텍스트 비교           | 단어·글자 단위 diff, 한글 자모 정확                   | P0  | live |
| sort-lines             | 줄 정렬           | sort lines alphabetically            | 자연 정렬, 한글 가나다순, 역순, 셔플                  | P2  | live |
| find-and-replace       | 찾아 바꾸기       | find and replace text                | 정규식, 대소문자 옵션                                 | P2  | live |
| lorem-ipsum            | 더미 텍스트       | lorem ipsum generator / 더미 텍스트  | 한국어 더미 텍스트                                    | P1  | live |
| korean-spell-check     | 맞춤법 검사       | 맞춤법 검사기                        | 브라우저 즉시 검사, 입력 전송 없음, 로컬 초안 복원    | P1  | live |
| hangul-romanization    | 한글 로마자 변환  | 한글 영문 변환 / korean romanization | 국립국어원 표기법 + 여권 이름 표기                    | P1  | live |
| text-to-speech         | 텍스트 읽어주기   | text to speech                       | Web Speech API, 다국어 음성                           | P1  | live |
| speech-to-text         | 받아쓰기          | speech to text / 음성 텍스트 변환    | 기기 내 Web Speech API, 음성 업로드 없음              | P1  | live |
| fancy-text             | 특수 폰트 텍스트  | fancy text generator                 | 인스타 바이오용 유니코드 서체                         | P1  | live |
| invisible-character    | 공백 문자         | invisible character / 투명 문자      | 복사 한 번, 플랫폼별 동작 안내                        | P1  | live |
| reverse-text           | 텍스트 뒤집기     | reverse text                         | 거꾸로, 상하 뒤집기                                   | P2  | live |
| word-frequency         | 단어 빈도         | word frequency counter               | CJK 분절, CSV 내보내기                                | P2  | todo |
| markdown-editor        | 마크다운 미리보기 | markdown editor online               | 실시간 미리보기, HTML 복사                            | P2  | todo |
| character-map          | 특수문자표        | special characters / 특수문자        | 한국어 키보드 특수문자(ㅁ+한자) 카테고리              | P1  | live |

| text-cleaner | 텍스트 정리 | clean up text / 텍스트 정리 | 줄바꿈·공백·스마트 따옴표·제로폭 문자를 목적별로 한 번에 정리 | P1 | todo |
| text-to-slug | URL 슬러그 만들기 | text to slug / URL 슬러그 변환 | 한글·일본어를 읽기 좋은 로마자로 변환하고 중복 구분자·예약어 검사 | P2 | todo |
| unicode-normalizer | 유니코드 정규화 | unicode normalizer / 유니코드 정규화 | NFC·NFD·NFKC 결과와 변경된 코드포인트를 나란히 표시 | P2 | todo |
| unicode-inspector | 유니코드 검사기 | unicode character inspector / 유니코드 문자 확인 | 이모지·결합 문자·보이지 않는 문자의 코드포인트와 이름을 즉시 표시 | P2 | todo |
| html-to-text | HTML 텍스트 추출 | html to text / HTML 텍스트 변환 | 스크립트·스타일 제외, 링크 URL 유지 여부와 읽기용 줄바꿈을 선택 | P1 | todo |
| text-chunker | 텍스트 나누기 | split text into chunks / 긴 글 나누기 | 글자·단어·토큰 추정 한도와 문장 경계를 함께 지켜 LLM 붙여넣기용으로 분할 | P1 | todo |
| whitespace-visualizer | 공백 문자 표시 | show whitespace characters / 공백 문자 표시 | 탭·줄바꿈·전각 공백·제로폭 문자를 구분해 보이고 원문 복사도 유지 | P2 | todo |

## time: 시간·날짜

| slug                | 도구              | 핵심 키워드                                                            | Edge 아이디어                                                                | P   | 상태                                |
| ------------------- | ----------------- | ---------------------------------------------------------------------- | ---------------------------------------------------------------------------- | --- | ----------------------------------- |
| timer               | 타이머            | timer, 5 minute timer / 타이머                                         | 백그라운드 정확, 새로고침 유지, 단축키, variants                             | P0  | live                                |
| stopwatch           | 스톱워치          | stopwatch / 스톱워치                                                   | 랩 기록 CSV, 밀리초, 새로고침 유지                                           | P0  | live                                |
| pomodoro-timer      | 뽀모도로          | pomodoro timer / 뽀모도로                                              | 세션 기록, 작업 목록, 알림                                                   | P0  | live                                |
| countdown           | 디데이 카운트다운 | countdown to date / 디데이 계산기                                      | 공유 링크(URL 파라미터), 이벤트 프리셋                                       | P0  | live                                |
| alarm-clock         | 온라인 알람       | online alarm clock / 알람                                              | 탭 유지 알람, 여러 알람                                                      | P1  | live                                |
| world-clock         | 세계 시계         | world clock / 세계 시간                                                | 회의 시간 플래너(시간대 겹침)                                                | P1  | live                                |
| time-zone-converter | 시간대 변환       | time zone converter / 시차 계산                                        | 도시 검색, DST 정확                                                          | P0  | live                                |
| date-calculator     | 날짜 계산기       | date calculator / 날짜 계산                                            | 영업일 계산, 국가별 공휴일                                                   | P0  | live                                |
| age-calculator      | 나이 계산기       | age calculator / 만 나이 계산기                                        | 한국 만 나이, 띠, 별자리                                                     | P0  | live                                |
| unix-timestamp      | 타임스탬프 변환   | unix timestamp converter                                               | 밀리초/초 자동 인식, 시간대                                                  | P1  | live                                |
| hours-calculator    | 근무 시간 계산    | hours calculator / 근무시간 계산                                       | 휴게 시간 차감, 주간 합계                                                    | P1  | live                                |
| online-clock        | 온라인 시계       | online clock / 현재 시간                                               | 전체화면 대형 시계, 서버 시간 동기화 없이 오차 표시                          | P1  | live                                |
| interval-timer      | 인터벌 타이머     | tabata timer / 인터벌 타이머                                           | 운동 프리셋, 음성 안내                                                       | P1  | live                                |
| metronome           | 메트로놈          | metronome / 메트로놈                                                   | Web Audio 정확한 박자, 탭 템포                                               | P1  | live                                |
| week-number         | 주차 계산         | what week is it / 몇 주차                                              | ISO 주차, 연간 달력                                                          | P2  | skip (구글 검색창 위젯이 바로 답함) |
| lunar-converter     | 음력 양력 변환    | korean lunar calendar converter / 음력 변환, 양력 음력 변환, 음력 생일 | 한국천문연구원 기준 데이터(윤달 포함), 올해·내년 음력 생일의 양력 날짜, 간지 | P0  | live                                |

## calculator: 계산기

| slug                    | 도구                 | 핵심 키워드                                                      | Edge 아이디어                                                                                                 | P   | 상태 |
| ----------------------- | -------------------- | ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- | --- | ---- |
| percentage-calculator   | 퍼센트 계산기        | percentage calculator / 퍼센트 계산                              | 4가지 유형 동시 표시, 계산식 노출                                                                             | P0  | live |
| scientific-calculator   | 공학용 계산기        | scientific calculator / 공학용 계산기                            | 키보드 입력, 히스토리                                                                                         | P0  | live |
| bmi-calculator          | BMI 계산기           | bmi calculator / bmi 계산                                        | 아시아 기준(대한비만학회) 병기                                                                                | P0  | live |
| loan-calculator         | 대출 이자 계산기     | loan calculator / 대출 이자 계산기                               | 원리금균등, 원금균등, 만기일시, 상환표                                                                        | P0  | live |
| salary-calculator-kr    | 연봉 실수령액        | 연봉 실수령액 계산기                                             | 2026년 4대보험 요율, 비과세 반영                                                                              | P0  | live |
| compound-interest       | 복리 계산기          | compound interest calculator / 복리 계산기                       | 적립식, 그래프                                                                                                | P0  | live |
| tip-calculator          | 팁 계산기            | tip calculator                                                   | 인원 분할, 국가별 팁 관행                                                                                     | P1  | live |
| discount-calculator     | 할인율 계산기        | discount calculator / 할인율 계산                                | 중복 할인, 원가 역산                                                                                          | P1  | live |
| gpa-calculator          | 학점 계산기          | gpa calculator / 학점 계산기                                     | 4.5/4.3/4.0 환산                                                                                              | P1  | live |
| fraction-calculator     | 분수 계산기          | fraction calculator                                              | 풀이 과정 표시                                                                                                | P1  | live |
| random-number           | 랜덤 숫자            | random number generator                                          | 중복 없음, 범위, 대량                                                                                         | P0  | live |
| calorie-calculator      | 칼로리 계산기        | calorie calculator / 기초대사량                                  | Mifflin-St Jeor 공식 명시                                                                                     | P1  | live |
| pregnancy-calculator    | 출산 예정일          | due date calculator / 출산예정일                                 | 주차별 정보                                                                                                   | P1  | live |
| vat-calculator          | 부가세 계산기        | vat calculator / 부가세 계산기                                   | 국가별 세율, 역산                                                                                             | P1  | live |
| severance-pay-kr        | 퇴직금 계산기        | 퇴직금 계산기                                                    | 평균임금 자동 계산                                                                                            | P1  | live |
| unemployment-benefit-kr | 실업급여 계산기      | 실업급여 계산기                                                  | 2026년 상하한액                                                                                               | P1  | live |
| pyeong-calculator       | 평수 계산기          | 평수 계산 / 평 제곱미터                                          | 공급·전용 면적 설명                                                                                           | P1  | live |
| ratio-calculator        | 비율 계산기          | ratio calculator / 비례식 계산                                   | 화면비, 레시피 비율                                                                                           | P2  | todo |
| average-calculator      | 평균 계산기          | average calculator                                               | 평균, 중앙값, 최빈값, 표준편차 한번에                                                                         | P2  | todo |
| electricity-bill-kr     | 전기요금 계산기      | 전기요금 계산기                                                  | 누진 구간 시각화                                                                                              | P2  | todo |
| exchange-rate           | 환율 계산기          | currency converter / 환율 계산기                                 | 실제 제시 환율·수수료·실질 환율을 함께 계산                                                                   | P1  | live |
| weekly-holiday-pay-kr   | 주휴수당 계산기      | weekly holiday pay korea / 주휴수당 계산기, 주휴수당 조건        | 요일별 근무시간 입력 → 주휴 발생 여부(주 15시간·개근)와 금액, 월급 환산, 2026 최저임금 비교, 미발생 이유 표시 | P0  | live |
| annual-leave-kr         | 연차 계산기          | annual leave calculator korea / 연차 계산기, 연차 일수, 연차수당 | 입사일 기준·회계연도 기준 둘 다, 1년 미만 월 단위 연차, 퇴사 시 미사용 연차수당                               | P0  | live |
| hourly-wage-kr          | 시급 계산기          | hourly to monthly wage korea / 시급 계산기, 알바 월급 계산기     | 시급 → 일급·주급·월급(주휴수당 포함/제외), 2026 최저시급 비교, 3.3% 공제                                      | P0  | live |
| social-insurance-kr     | 4대보험 계산기       | korea social insurance calculator / 4대보험 계산기, 4대보험 요율 | 2026 요율로 근로자·사업주 부담 분리, 월급·연봉 입력, 항목별 상한·하한 반영                                    | P0  | live |
| rent-conversion-kr      | 전월세 전환율 계산기 | jeonse to monthly rent korea / 전월세 전환율, 전세 월세 전환     | 법정 전환율 상한 자동 적용, 보증금 ↔ 월세 양방향, 계산 근거 표시                                              | P1  | live |

| overtime-pay-kr | 연장근로수당 계산기 | korea overtime pay calculator / 연장근로수당 계산기, 야근수당 | 통상시급과 연장·야간·휴일 시간을 분리해 가산율·근거를 월급명세서 형태로 표시 | P1 | todo |
| night-shift-pay-kr | 야간수당 계산기 | korea night shift pay / 야간수당 계산기 | 22시~06시 구간을 날짜 넘김 근무에도 자동 분리하고 연장근로와 중첩 가산 표시 | P1 | todo |
| freelance-withholding-kr | 프리랜서 3.3% 계산기 | 3.3% calculator korea / 프리랜서 3.3 계산기 | 세전·실수령액 양방향 계산, 소득세와 지방소득세를 분리하고 환급 가능성 안내 | P1 | todo |
| employer-cost-kr | 인건비 계산기 | korea employer cost calculator / 직원 고용비용 계산기 | 사업주 4대보험·퇴직급여 충당·복리후생을 분리해 1인·팀 총비용 비교 | P1 | todo |
| broker-fee-kr | 부동산 중개수수료 계산기 | korea real estate broker fee / 복비 계산기 | 매매·전세·월세별 상한 요율과 거래금액 구간을 보여 주고 부가세 포함 여부 선택 | P1 | todo |
| acquisition-tax-kr | 취득세 계산기 | korea acquisition tax calculator / 취득세 계산기 | 주택 수·조정대상지역·취득가를 입력해 세율 분기와 지방교육세를 계산 근거와 함께 표시 | P1 | todo |
| profit-margin-calculator | 마진율 계산기 | profit margin calculator / 마진율 계산기 | 원가·판매가·수수료·배송비를 분리해 마진율과 마크업을 혼동 없이 동시 계산 | P1 | todo |
| break-even-calculator | 손익분기점 계산기 | break even calculator / 손익분기점 계산기 | 고정비·변동비·목표이익을 입력해 판매량·매출 기준을 그래프로 함께 표시 | P1 | todo |
| savings-goal-calculator | 저축 목표 계산기 | savings goal calculator / 저축 목표 계산기 | 목표일·초기금·월 저축액 중 모르는 한 값을 역산하고 월별 진행표 표시 | P1 | todo |

## converter: 단위 변환

단위 변환은 **도구 1개 + 단위 쌍 variants**로 롱테일을 공략한다(예: `/length-converter/cm-to-inches`).

| slug                    | 도구           | 핵심 키워드                                 | Edge 아이디어                 | P   | 상태                                |
| ----------------------- | -------------- | ------------------------------------------- | ----------------------------- | --- | ----------------------------------- |
| length-converter        | 길이 변환      | cm to inches, feet to meters / cm 인치 변환 | 키(ft'in") 입력, 빠른 표      | P0  | live                                |
| weight-converter        | 무게 변환      | kg to lbs / kg 파운드                       | 근, 돈 등 한국 단위           | P0  | live                                |
| temperature-converter   | 온도 변환      | celsius to fahrenheit / 섭씨 화씨           | 요리 온도 표                  | P0  | live                                |
| area-converter          | 넓이 변환      | sq ft to m2 / 평 계산                       | 평 ↔ ㎡ 강조                  | P1  | live                                |
| volume-converter        | 부피 변환      | cups to ml / 컵 ml                          | 요리 계량 (US/메트릭 컵 구분) | P1  | live                                |
| speed-converter         | 속도 변환      | mph to kmh                                  | 페이스(분/km) 변환            | P1  | live                                |
| data-size-converter     | 데이터 크기    | mb to gb / 용량 변환                        | 1000 vs 1024 둘 다 표시       | P1  | live                                |
| shoe-size-converter     | 신발 사이즈    | shoe size conversion / 신발 사이즈 표       | 브랜드별 차이 안내            | P1  | live                                |
| clothing-size-converter | 옷 사이즈      | clothing size chart / 옷 사이즈 변환        | 국가별 표                     | P2  | todo                                |
| number-base-converter   | 진법 변환      | binary to decimal / 진법 변환               | 실시간 다중 진법              | P1  | live                                |
| roman-numerals          | 로마 숫자      | roman numeral converter                     | 양방향 + 규칙 설명            | P2  | skip (구글 검색창 위젯이 바로 답함) |
| korean-number           | 숫자 한글 변환 | 숫자 한글 변환 / 금액 한글                  | 수표·계약서용 "일금 ○○원정"   | P1  | live                                |
| cooking-converter       | 요리 계량      | tablespoon to grams                         | 재료별 밀도                   | P2  | skip (구글 검색창 위젯이 바로 답함) |
| pressure-converter      | 압력 변환      | psi to bar                                  | 타이어 압력 표                | P2  | skip (구글 검색창 위젯이 바로 답함) |
| energy-converter        | 에너지 변환    | kcal to kj                                  | —                             | P2  | skip (구글 검색창 위젯이 바로 답함) |

## developer: 개발자 도구

| slug              | 도구             | 핵심 키워드                                | Edge 아이디어                        | P   | 상태 |
| ----------------- | ---------------- | ------------------------------------------ | ------------------------------------ | --- | ---- |
| json-formatter    | JSON 포맷터      | json formatter / json 정렬                 | 트리 뷰, 오류 위치 표시, 대용량 성능 | P0  | live |
| base64            | Base64 인코딩    | base64 decode / base64 변환                | 파일 지원, URL-safe                  | P0  | live |
| url-encoder       | URL 인코딩       | url encode decode                          | 쿼리 파라미터 표 분해                | P1  | live |
| uuid-generator    | UUID 생성        | uuid generator                             | v4/v7, 대량, 형식 옵션               | P1  | live |
| hash-generator    | 해시 생성        | sha256 generator / md5                     | 파일 해시, Web Crypto                | P1  | live |
| jwt-decoder       | JWT 디코더       | jwt decode                                 | 만료 시간 사람이 읽는 형태로         | P1  | live |
| regex-tester      | 정규식 테스트    | regex tester                               | 매치 하이라이트, 설명                | P1  | live |
| diff-checker-code | 코드 비교        | diff checker                               | 구문 하이라이트 diff                 | P2  | todo |
| cron-parser       | Cron 해석        | cron expression                            | 다음 실행 시각 목록                  | P2  | todo |
| color-converter   | 색상 변환        | hex to rgb                                 | OKLCH 포함, 대비율                   | P1  | live |
| css-minifier      | CSS/JS 압축      | minify css                                 | —                                    | P2  | todo |
| sql-formatter     | SQL 포맷터       | sql formatter                              | 방언 선택                            | P2  | todo |
| yaml-json         | YAML ↔ JSON      | yaml to json                               | 양방향                               | P2  | todo |
| csv-json          | CSV ↔ JSON       | csv to json                                | 미리보기 표                          | P1  | live |
| html-entities     | HTML 엔티티      | html encode                                | —                                    | P2  | todo |
| user-agent        | 내 브라우저 정보 | what is my browser / user agent            | 해석된 정보 + 복사                   | P2  | todo |
| screen-resolution | 화면 해상도 확인 | what is my screen resolution / 해상도 확인 | DPR, 뷰포트 함께                     | P1  | live |

| json-to-typescript | JSON → TypeScript | json to typescript / JSON 타입스크립트 변환 | 중첩 배열·optional 필드를 추론하고 interface·type·Zod 스키마 선택 | P1 | todo |
| xml-formatter | XML 포맷터 | xml formatter / XML 정렬 | 오류 행·열 표시, 접기 가능한 트리와 대용량 붙여넣기 처리 | P1 | todo |
| xml-json | XML ↔ JSON 변환 | xml to json / XML JSON 변환 | 속성·CDATA·반복 요소의 변환 규칙을 미리보기로 명시 | P1 | todo |
| url-parser | URL 분석기 | url parser / URL 분석 | 쿼리 파라미터·인코딩·fragment·상대 URL을 표로 분해하고 안전하게 복사 | P1 | todo |
| open-graph-generator | OG 태그 생성기 | open graph meta generator / OG 태그 생성기 | 입력 즉시 Facebook·X·카카오 공유 카드 미리보기와 HTML 메타 태그 생성 | P1 | todo |
| robots-txt-generator | robots.txt 생성기 | robots.txt generator / robots.txt 만들기 | User-agent별 allow/disallow·sitemap 구문 검사와 복사 가능한 결과 | P2 | todo |
| sitemap-generator | 사이트맵 생성기 | xml sitemap generator / XML 사이트맵 만들기 | URL 목록에서 lastmod·changefreq·priority를 검증해 XML과 robots.txt 줄을 함께 생성 | P2 | todo |
| css-box-shadow-generator | CSS 그림자 생성기 | css box shadow generator / CSS 그림자 만들기 | 다중 그림자·inset·색 대비를 실시간 미리보기와 복사 가능한 CSS로 제공 | P2 | todo |
| css-clip-path-generator | CSS 클리핑 경로 생성기 | css clip path generator / CSS 도형 만들기 | 점을 드래그해 polygon·circle·inset 값을 만들고 반응형 좌표 복사 | P2 | todo |
| css-grid-generator | CSS Grid 생성기 | css grid generator / CSS 그리드 생성기 | 드래그로 행·열·gap·영역 이름을 만들고 바로 붙여넣을 HTML/CSS 출력 | P1 | todo |

## generator: 생성기

| slug                | 도구           | 핵심 키워드                          | Edge 아이디어                                     | P   | 상태 |
| ------------------- | -------------- | ------------------------------------ | ------------------------------------------------- | --- | ---- |
| qr-code-generator   | QR 코드 생성   | qr code generator / qr코드 만들기    | 만료 없음(정적 QR), 로고 삽입, SVG, 워터마크 없음 | P0  | live |
| password-generator  | 비밀번호 생성  | password generator / 비밀번호 생성기 | 엔트로피 표시, 외우기 쉬운 단어 조합              | P0  | live |
| qr-code-scanner     | QR 코드 스캐너 | qr code scanner online               | 카메라, 이미지 파일                               | P1  | live |
| barcode-generator   | 바코드 생성    | barcode generator                    | EAN, Code128, SVG                                 | P1  | live |
| random-picker       | 랜덤 뽑기      | random name picker / 제비뽑기        | 룰렛 애니메이션, 결과 공유                        | P0  | live |
| team-generator      | 팀 나누기      | random team generator / 팀 나누기    | 실력 밸런스 옵션                                  | P1  | live |
| dice-roller         | 주사위         | roll dice / 주사위 굴리기            | 여러 개, D&D 다면체                               | P1  | live |
| coin-flip           | 동전 던지기    | flip a coin / 동전 던지기            | 통계 누적                                         | P1  | live |
| spin-wheel          | 돌림판         | spin the wheel / 돌림판              | 항목 저장, 전체화면                               | P0  | live |
| ladder-game         | 사다리 타기    | 사다리 타기                          | 애니메이션, 결과 공유                             | P1  | live |
| lotto-generator     | 로또 번호      | 로또 번호 생성기                     | 제외수, 고정수                                    | P1  | live |
| username-generator  | 닉네임 생성    | username generator / 닉네임 추천     | 한글 닉네임                                       | P2  | todo |
| signature-generator | 서명 만들기    | signature generator / 서명 만들기    | 손글씨, 폰트 서명, 투명 PNG                       | P1  | live |

| wifi-qr-generator | Wi-Fi QR 코드 만들기 | wifi qr code generator / 와이파이 QR코드 만들기 | SSID·보안 방식·숨김 네트워크를 전용 폼으로 입력하고 비밀번호가 기기를 떠나지 않음 | P1 | todo |
| vcard-qr-generator | 연락처 QR 코드 만들기 | vcard qr code generator / 연락처 QR코드 만들기 | 이름·전화·이메일·조직을 vCard 표준으로 검증하고 QR·.vcf를 함께 저장 | P2 | todo |
| calendar-qr-generator | 일정 QR 코드 만들기 | calendar event qr code / 일정 QR코드 만들기 | 시간대·종일 일정·알림을 포함한 iCalendar QR와 .ics 파일을 함께 생성 | P2 | todo |
| bingo-card-generator | 빙고판 만들기 | bingo card generator / 빙고판 만들기 | 항목 목록에서 중복 없는 여러 장의 인쇄용 빙고판 PDF를 생성 | P1 | todo |
| word-search-generator | 단어 찾기 퍼즐 만들기 | word search generator / 단어 찾기 퍼즐 만들기 | 한글·영문 단어를 겹쳐 배치하고 정답지 포함 인쇄용 PDF를 생성 | P2 | todo |

## device: 기기 테스트 (신규 카테고리)

검색량이 매우 크고, 브라우저 API로 100% 구현할 수 있으며, 광고가 많은 경쟁 사이트가 대부분이다.

| slug               | 도구            | 핵심 키워드                          | Edge 아이디어                    | P   | 상태 |
| ------------------ | --------------- | ------------------------------------ | -------------------------------- | --- | ---- |
| mic-test           | 마이크 테스트   | mic test / 마이크 테스트             | 레벨 미터, 녹음 재생, 장치 선택  | P0  | live |
| webcam-test        | 웹캠 테스트     | webcam test / 웹캠 테스트            | 해상도, FPS 표시, 스냅샷         | P0  | live |
| keyboard-tester    | 키보드 테스트   | keyboard test / 키보드 테스트        | 레이아웃 선택, 동시 입력(NKRO)   | P0  | live |
| mouse-test         | 마우스 테스트   | mouse test / 더블클릭 테스트         | 더블클릭 오작동 감지             | P1  | live |
| dead-pixel-test    | 불량화소 테스트 | dead pixel test / 불량화소           | 전체화면 색 순환                 | P1  | live |
| speaker-test       | 스피커 테스트   | speaker test / 좌우 스피커 테스트    | 좌우, 주파수 스윕                | P1  | live |
| typing-test        | 타자 연습       | typing test / 타자 연습              | 한글 타수, 영문 WPM              | P0  | live |
| refresh-rate-test  | 주사율 테스트   | refresh rate test / hz 확인          | —                                | P2  | todo |
| click-speed-test   | 클릭 속도       | cps test                             | 키보드 조작, 로컬 개인 최고 기록 | P2  | live |
| reaction-time-test | 반응속도        | reaction time test / 반응속도 테스트 | 평균, 백분위                     | P2  | live |

| gamepad-tester | 게임패드 테스트 | gamepad tester / 게임패드 테스트 | 버튼·스틱·트리거의 실시간 값, 데드존과 진동 지원 여부를 한 화면에서 검사 | P1 | todo |
| touch-screen-test | 터치스크린 테스트 | touch screen test / 터치 테스트 | 멀티터치 점·압력·좌표를 전체화면에서 표시하고 누락 영역을 확인 | P1 | todo |
| browser-permissions-test | 브라우저 권한 확인 | browser permissions test / 브라우저 권한 확인 | 카메라·마이크·위치 권한 상태와 브라우저별 재설정 경로를 로컬에서 안내 | P2 | todo |
| webgl-test | WebGL 테스트 | webgl test / WebGL 확인 | 렌더러·WebGL 버전·확장 기능·컨텍스트 손실을 짧은 그래픽 테스트로 점검 | P2 | todo |

## color: 색상·디자인 (신규 카테고리)

| slug               | 도구        | 핵심 키워드             | Edge 아이디어           | P   | 상태 |
| ------------------ | ----------- | ----------------------- | ----------------------- | --- | ---- |
| color-picker       | 색상 추출   | color picker from image | 이미지에서 추출, 팔레트 | P1  | live |
| contrast-checker   | 명도 대비   | contrast checker        | WCAG 2 + APCA           | P1  | live |
| gradient-generator | 그라데이션  | css gradient generator  | OKLCH 보간              | P2  | todo |
| palette-generator  | 팔레트 생성 | color palette generator | 접근성 검증 포함        | P2  | todo |

| color-blindness-simulator | 색각 이상 시뮬레이터 | color blindness simulator / 색맹 시뮬레이터 | 이미지를 프로타노피아·듀테라노피아·트리타노피아로 즉시 비교하고 파일은 업로드하지 않음 | P1 | todo |
| color-name-finder | 색상 이름 찾기 | color name from hex / 색상 이름 찾기 | HEX·RGB에서 CSS·일반 색상 이름과 가장 가까운 접근성 대체색을 함께 표시 | P2 | todo |
| css-color-mixer | CSS 색상 혼합기 | css color mixer / CSS 색상 섞기 | sRGB·OKLCH 혼합 결과와 대비율·복사 가능한 color-mix() 코드를 나란히 제공 | P2 | todo |

## media: 오디오·비디오 (신규 카테고리, ffmpeg.wasm 지연 로드, JS 예산 예외 검토)

| slug                  | 도구               | 핵심 키워드                                                            | Edge 아이디어                                                                 | P   | 상태 |
| --------------------- | ------------------ | ---------------------------------------------------------------------- | ----------------------------------------------------------------------------- | --- | ---- |
| video-to-gif          | 동영상 → GIF       | video to gif                                                           | 업로드 없음                                                                   | P1  | live |
| video-compressor      | 동영상 압축        | compress video / 동영상 용량 줄이기                                    | 업로드 없음(대용량 강점)                                                      | P1  | live |
| audio-converter       | 오디오 변환        | mp3 converter                                                          | —                                                                             | P2  | todo |
| audio-cutter          | 오디오 자르기      | mp3 cutter / 벨소리 만들기                                             | 파형 편집                                                                     | P1  | live |
| voice-recorder        | 음성 녹음          | online voice recorder / 녹음기                                         | 업로드 없음, mp3 저장                                                         | P1  | live |
| screen-recorder       | 화면 녹화          | screen recorder online / 화면 녹화                                     | 설치 없음, 워터마크 없음                                                      | P1  | live |
| video-to-mp3          | 동영상 → MP3       | mp4 to mp3, extract audio from video / 동영상 mp3 변환, 영상 소리 추출 | 업로드 없음, 브라우저 디코딩 + MP3 인코딩(작은 인코더 지연 로드), 구간 선택   | P1  | live |
| video-trimmer         | 동영상 자르기      | trim video / 동영상 자르기                                             | 프레임 미리보기로 시작·끝을 정확히 고르고 재인코딩 없이 가능한 경우 즉시 저장 | P1  | todo |
| video-merger          | 동영상 합치기      | merge videos / 동영상 합치기                                           | 순서 드래그·해상도 불일치 경고·전환 없는 한 파일 출력, 업로드 없음            | P1  | todo |
| video-cropper         | 동영상 화면 자르기 | crop video / 동영상 화면 자르기                                        | 9:16·1:1·16:9 프리셋과 프레임별 미리보기, 개인정보 영역 가리기 연계           | P1  | todo |
| video-rotate-flip     | 동영상 회전·뒤집기 | rotate video / 동영상 회전                                             | 세로 영상 방향 자동 감지, 90° 회전·좌우 반전을 미리보기로 확인                | P1  | todo |
| video-resizer         | 동영상 크기 조절   | resize video / 동영상 해상도 변경                                      | SNS·메신저 프리셋, 비율 잠금·예상 용량 표시, 파일 업로드 없음                 | P1  | todo |
| video-muter           | 동영상 소리 제거   | mute video / 동영상 음소거                                             | 오디오 트랙만 안전하게 제거하고 원본 영상 코덱·해상도를 최대한 유지           | P1  | todo |
| video-speed-changer   | 동영상 속도 조절   | change video speed / 동영상 배속 조절                                  | 0.25×~4×와 오디오 피치 유지 선택, 길이·예상 용량을 즉시 표시                  | P1  | todo |
| video-frame-extractor | 동영상 프레임 추출 | extract frames from video / 동영상 사진 추출                           | 시간·장면 간격으로 JPG/PNG를 뽑고 선택 프레임만 ZIP                           | P1  | todo |
| audio-joiner          | 오디오 합치기      | join audio files / mp3 합치기                                          | 여러 파일 순서·간격·크로스페이드를 파형으로 확인하고 로컬에서 하나로 저장     | P1  | todo |
| audio-volume-booster  | 오디오 볼륨 조절   | increase audio volume / mp3 볼륨 키우기                                | 클리핑 경고·정규화·페이드 인/아웃을 파형 미리보기로 제공                      | P1  | todo |
| audio-speed-changer   | 오디오 속도 조절   | change audio speed / mp3 배속 조절                                     | 음성 피치 유지 옵션과 결과 길이·파형 비교, 구간 반복 미리듣기                 | P1  | todo |
| audio-reverser        | 오디오 역재생      | reverse audio / 오디오 거꾸로 재생                                     | 전체·선택 구간 역재생, 즉시 미리듣기와 WAV/MP3 저장                           | P2  | todo |
