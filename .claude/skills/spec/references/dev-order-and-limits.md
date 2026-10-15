## 10. 개발 순서 제안

1. Notion 연결과 두 데이터베이스를 만들고, 샘플 메모 몇 장과 스티커 몇 개를 Notion 화면에서 직접 입력합니다.
2. `lib/notion.ts`, `lib/board.ts`를 만들고 `getBoard()` 결과를 페이지에 JSON으로 출력해서 변환이 맞는지 확인합니다.
3. 프로토타입 화면을 React 컴포넌트로 옮기고, 테스트 데이터 대신 `getBoard()` 결과를 연결합니다.
4. `addNote`, `placeSticker`, `removeSticker` 액션과 낙관적 업데이트를 붙입니다.
5. 작성자 키와 입장 코드를 붙이고, 시크릿 창 두 개로 "내 스티커만 뗄 수 있는지"를 확인합니다.
6. Vercel에 배포하고, 크루 몇 명과 동시에 스티커를 붙여 보면서 429 오류가 나는지 로그를 확인합니다.
7. 전달 당일에는 입장 코드를 코치님께 드리고, Notion의 Notes 데이터베이스를 별도 페이지로 복제해서 기념본으로 함께 드릴 수 있습니다.

---

## 11. 알려진 한계

- Notion은 실시간 구독 기능이 없어서, 다른 크루가 붙인 메모는 캐시가 갱신된 뒤 새로고침하거나 일정 간격으로 `router.refresh()`를 호출해야 보입니다.
- "한 장에 스티커 한 개" 규칙은 DB가 강제하지 않고 코드와 읽기 시점의 중복 제거로 지키기 때문에, Notion 데이터베이스에는 드물게 중복 행이 남을 수 있습니다.
- 행사 시간처럼 수십 명이 같은 1분 안에 동시에 쓰면 연결의 분당 한도에 닿을 수 있으며, SDK의 자동 재시도가 기다려 주지만 응답이 몇 초 늦어질 수 있습니다.
- 메모가 수천 장으로 늘어나면 보드 전체를 한 번에 불러오는 방식이 느려지므로, 그 규모가 예상된다면 Supabase 같은 DB로 옮기는 편이 낫습니다.

---

## 참고 링크

- [Notion: Upgrading to 2025-09-03 (데이터 소스 변경)](https://developers.notion.com/docs/upgrade-guide-2025-09-03)
- [Notion: Request limits (요청 수, 크기 제한, 429 처리)](https://developers.notion.com/reference/request-limits)
- [Notion: Rate limits](https://developers.notion.com/reference/rate-limits)
- [Notion: Authorization (연결 만들기와 페이지 공유)](https://developers.notion.com/docs/authorization)
- [Next.js: cacheTag, updateTag, revalidateTag](https://unpkg.com/next@16.3.8/dist/docs/01-app/03-api-reference/04-functions/cacheTag.md)
