# 문서 SSOT 규칙

이 프로젝트의 단일 진실 공급원(SSOT)은 아래 문서들이다.

- `.claude/skills/spec/references/overview.md`
- `.claude/skills/spec/references/notion-setup.md`
- `.claude/skills/spec/references/nextjs-setup.md`
- `.claude/skills/spec/references/data-layer.md`
- `.claude/skills/spec/references/identity-gate.md`
- `.claude/skills/spec/references/server-actions.md`
- `.claude/skills/spec/references/ui.md`
- `.claude/skills/spec/references/Prototype.dc.html`
- `.claude/skills/spec/references/security.md`
- `.claude/skills/spec/references/deploy.md`
- `.claude/skills/spec/references/dev-order-and-limits.md`

## 규칙

1. **문서가 항상 옳다.** 코드와 문서가 충돌하면 예외 없이 문서가 정답이다. 코드를 문서에 맞게 수정한다. 코드의 현재 동작을 근거로 문서를 고치지 않는다.
2. **문서 먼저, 코드 나중.** 사용자 요청이 문서의 방향·내용과 다르면 바로 구현하지 않는다.
   1. 어떤 문서의 어떤 부분과 충돌하는지 사용자에게 알린다.
   2. 사용자 확인을 받아 문서를 먼저 수정한다.
   3. 수정된 문서를 기준으로 개발을 진행한다.
3. **문서에 없는 것은 만들지 않는다.** 문서에 정의되지 않은 기능·동작·정책이 필요하면 추측으로 구현하지 말고, 문서에 추가할 내용을 사용자와 합의한 뒤 문서를 갱신하고 구현한다.
4. **충돌 발견 시 즉시 보고.** 작업 중 코드-문서 불일치나 문서 간 모순을 발견하면 작업을 이어가기 전에 사용자에게 보고한다.
5. **파생 산출물은 문서를 따른다.** 로드맵(`.claude/skills/roadmap/ROADMAP.md`), CLAUDE.md, 주석, 테스트 등은 문서의 파생물이다. 문서가 바뀌면 파생물을 함께 갱신한다. 파생물과 문서가 다르면 문서가 옳다.
6. **구현 전 해당 문서 확인.** 작업을 시작하기 전에 관련 문서 섹션을 먼저 읽는다. 기억이나 추측에 의존하지 않는다.
7. **모든 결정은 결정 기록 한 파일에 남긴다.** 문서 수정, 미결정 사항 확정, 문서가 정하지 않은 부분을 작업 중에 정한 것까지 모두 `.claude/skills/spec/references/decisions.md`에 그 파일의 형식대로 추가한다. 다른 곳에 결정을 따로 적지 않는다.
   - 사용자 확인 없이 Claude가 정한 것은 `Claude (사용자 확인 전)`으로 표시하고, 작업 보고 때 사용자에게 알린다.
   - 결정 기록은 이유를 남기는 이력이다. 명세 내용은 위 SSOT 문서가 정하므로, 결정이 문서 내용을 바꾸면 문서도 함께 고친다.
   - 로드맵의 미결정 사항이 정해지면 그 줄을 지우고 결정 번호(D-n)를 해당 작업에 남긴다.
