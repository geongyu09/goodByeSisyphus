# 코치님 롤링페이퍼

크루들이 코치님께 메모와 스티커를 남기는 코르크보드 롤링페이퍼. Next.js 서버가 Notion API로 데이터를 저장하고 불러온다.

## SSOT
문서가 유일한 진실이다. 코드와 문서가 충돌하면 문서가 옳다. 상세: `.claude/rules/ssot.md`

## 문서 위치
- 기획 문서(SSOT): `.claude/skills/spec/` (`/spec`)
- 전체 구조: `.claude/skills/spec/references/overview.md`
- Notion 설정·스키마·API 제한: `.claude/skills/spec/references/notion-setup.md`
- 프로젝트 설정·환경 변수·폴더 구조: `.claude/skills/spec/references/nextjs-setup.md`
- 데이터 조회·캐시: `.claude/skills/spec/references/data-layer.md`
- 작성자 키·입장 코드: `.claude/skills/spec/references/identity-gate.md`
- Server Actions·입력 검증: `.claude/skills/spec/references/server-actions.md`
- 화면: `.claude/skills/spec/references/ui.md`, 프로토타입 원본 `.claude/skills/spec/references/Prototype.dc.html`
- 보안: `.claude/skills/spec/references/security.md`
- 배포: `.claude/skills/spec/references/deploy.md`
- 개발 순서·한계·참고 링크: `.claude/skills/spec/references/dev-order-and-limits.md`
- 결정 기록(모든 결정을 여기 한 곳에): `.claude/skills/spec/references/decisions.md`

## 개발 진행
로드맵 기반으로 진행한다: `/roadmap` (다음 작업), `/roadmap status`, `/roadmap sync`

## 웹 확인
웹 기반 확인(화면 동작 확인, 스크린샷, 콘솔 확인 등)은 모두 aside(`aside-browser` 스킬)로 한다.
