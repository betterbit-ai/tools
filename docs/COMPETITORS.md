# 레퍼런스 사이트 조사

> 조사일: 2026-10-07. 트래픽 수치는 Similarweb, Semrush 등의 추정치라 출처마다 차이가 크다. 규모를 가늠하는 용도로만 쓴다.
> 도구별 경쟁 조사는 각 도구의 `meta.competitors`에 기록한다. 이 문서는 사이트 단위 전략 레퍼런스다.

## 요약 표

| 사이트                  | 규모 (월 방문, 추정)                        | 무엇을 잘하나                                                           | 약점 = 우리의 기회                                 |
| ----------------------- | ------------------------------------------- | ----------------------------------------------------------------------- | -------------------------------------------------- |
| **calculator.net**      | ~6,000만 (2026-08)                          | 수백 개 계산기, 빠르고 단순한 페이지, 롱테일 키워드 전부 점유           | 2000년대식 디자인, 광고, 모바일 UX 약함, 영어 중심 |
| **iLovePDF**            | ~1.5억 (2026-09, Semrush)                   | "의도 하나 = 페이지 하나"(merge-pdf, split-pdf…), 25개 이상 언어 현지화 | 서버 업로드, 무료 사용량 제한 후 유료 전환 유도    |
| **Smallpdf**            | ~4,300만~5,300만 (2026-08)                  | 깔끔한 디자인, 브랜드 신뢰도                                            | 하루 사용 제한, 회원가입 유도, 서버 업로드         |
| **Omni Calculator**     | ~580만 검색 유입 (2026-08)                  | 계산기마다 공식, 예시, 전문가 검수를 붙인 깊은 콘텐츠 (E-E-A-T)         | 광고가 많고 페이지가 무겁다                        |
| **vClock**              | ~680만 / 3개월 (2026-06), **직접 유입 55%** | 즐겨찾기로 매일 다시 오는 유틸리티                                      | 광고, 오래된 UI                                    |
| **Online-Stopwatch**    | ~420만 (2026-05), 유기 검색 47%             | 테마 타이머 수십 개                                                     | 광고, 산만한 디자인                                |
| **TinyWow**             | ~180만 (추정, 출처 신뢰도 낮음)             | PDF, 이미지, 비디오, AI 도구를 한곳에 모은 넓은 범위                    | 광고, 대기 화면, 서버 업로드                       |
| **IT-Tools** (오픈소스) | GitHub ★ 3.8만                              | 개발자 도구 수십 개, 좋은 UX, 셀프 호스팅                               | 개발자 전용, 일반인 대상 SEO 콘텐츠 없음           |
| **Squoosh** (Google)    | —                                           | WASM 기반 100% 클라이언트 처리, 압도적 화질 제어                        | 한 번에 한 장, 프리셋 없음                         |

## 배운 점 → 우리 전략

1. **넓게 가는 것이 이긴다 (calculator.net).** 디자인이 낡아도 수백 개 롱테일 의도를 모두 페이지로 만들어 월 6천만 방문을 만든다. 그래서 우리는 도구 수를 KPI로 삼되, 각 도구의 완성도는 그들보다 높게 유지한다.
2. **의도 하나에 URL 하나 (iLovePDF).** "PDF 도구" 페이지 하나가 아니라 `merge-pdf`, `split-pdf`, `compress-pdf`를 각각 따로 둔다. 우리도 `image-resizer`, `image-compressor`, `image-cropper`를 각각 별도 도구로 만든다. 한 도구 안에서 검색 수요가 큰 변형은 `variants`로 분리한다(예: `/timer/5-minutes`).
3. **현지화가 트래픽을 몇 배로 만든다 (iLovePDF, 25개 이상 언어).** 영어 키워드는 경쟁이 치열하지만 일본어, 스페인어, 포르투갈어, 인도네시아어 등은 상대적으로 비어 있다. 로케일을 추가할 때 모든 도구가 동시에 번역되도록 타입으로 강제해 두었다.
4. **즐겨찾기 유틸리티는 직접 유입이 크다 (vClock 55%).** 타이머, 시계, 메모처럼 매일 쓰는 도구는 한 번 정착하면 SEO 없이도 재방문한다. 상태 복원, 빠른 로딩, 키보드 단축키에 투자하면 이 재방문율이 올라간다.
5. **도구마다 콘텐츠 깊이가 필요하다 (Omni).** 공식, 근거(출처), 실제 수치, FAQ를 넣는다. LLM이 인용하기 좋은 "자체 완결형 답변"이 GEO의 핵심이다.
6. **개인정보 보호와 광고 없음이 차별점이 된다 (Squoosh, IT-Tools vs TinyWow).** 1위 사이트들은 대부분 서버 업로드와 광고 모델이다. "업로드 없음, 광고 없음, 가입 없음"은 그것만으로 클릭할 이유가 된다.

## 출처

- [smallpdf.com — Semrush](https://www.semrush.com/website/smallpdf.com/overview/)
- [ilovepdf.com — Similarweb](https://www.similarweb.com/website/ilovepdf.com/)
- [ilovepdf vs smallpdf — Similarweb](https://www.similarweb.com/website/ilovepdf.com/vs/smallpdf.com/)
- [calculator.net — Similarweb](https://www.similarweb.com/website/calculator.net/)
- [omnicalculator.com — Semrush](https://www.semrush.com/website/omnicalculator.com/overview/)
- [vclock.com — Similarweb](https://www.similarweb.com/website/vclock.com/)
- [online-stopwatch.com — Similarweb](https://www.similarweb.com/website/online-stopwatch.com/)
- [TinyWow — creati.ai](https://creati.ai/ai-tools/tinywow/)
- [IT-Tools — gittrend](https://gittrend.io/repo/CorentinTh/it-tools)
- [Squoosh privacy — orthogonal.info](https://orthogonal.info/compress-images-without-uploading/)
- [WordCounter.net](https://wordcounter.net/) (직접 확인: Grammarly 업셀, 로그인 유도)
- [사람인 글자수세기](https://www.saramin.co.kr/zf_user/tools/character-counter) (직접 확인: 공백 포함/제외 + byte, 맞춤법 검사 있음)

## 주기적 업데이트

분기마다 이 표의 수치를 갱신하고, 새로 떠오르는 도구 사이트가 있으면 추가한다. Planner 에이전트는 이 문서와 `docs/CATALOG.md`를 함께 참고해 다음 작업을 제안한다.
