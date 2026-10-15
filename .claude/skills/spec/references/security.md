## 8. 보안 체크리스트

- 토큰과 비밀 값은 `NEXT_PUBLIC_` 없이 서버 환경 변수에만 두고, Notion을 호출하는 파일에는 `import 'server-only'`를 넣습니다.
- 모든 Server Action은 zod로 입력을 검증하고, 입장 전에 호출하는 `enterAction`을 뺀 나머지는 입장 확인(`guard`)도 거친 뒤에 Notion을 호출합니다.
- 메시지는 React가 텍스트로 이스케이프해서 그리기 때문에 `dangerouslySetInnerHTML`을 쓰지 않으면 XSS 걱정이 없으며, 줄바꿈은 CSS `white-space: pre-line`으로 표시합니다.
- 장난성 메모는 Notion에서 `hidden`을 체크하면 다음 재조회 때 보드에서 사라지므로, 운영자용 화면을 따로 만들지 않아도 됩니다.
- 한 사람이 짧은 시간에 메모를 수십 장 올리는 경우를 막고 싶다면, Notes 데이터에서 같은 `authorKey`의 최근 작성 시각을 확인해 1분에 1장 정도로 제한할 수 있습니다.
