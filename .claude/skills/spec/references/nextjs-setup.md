## 3. Next.js 프로젝트 준비

### 3-1. 생성과 패키지

Next.js 앱은 하위 폴더가 아니라 프로젝트 루트(`goodByeSisyphus/`)에 둡니다. `create-next-app`은 이미 다른 파일(`.claude/`, `CLAUDE.md` 등)이 있는 폴더나 대문자가 들어간 폴더 이름에는 바로 만들 수 없으므로, 임시 하위 폴더에 만든 뒤 루트로 옮깁니다.

```bash
# 프로젝트 루트에서 실행합니다.
npx create-next-app@latest rolling-paper --ts --app --eslint
rsync -a rolling-paper/ ./ && rm -rf rolling-paper
npm i @notionhq/client zod server-only
```

### 3-2. 환경 변수 (`.env.local`)

```bash
NOTION_TOKEN=ntn_xxx                 # 2-1에서 복사한 토큰
NOTION_NOTES_DS=xxxxxxxx-xxxx-...    # Notes 데이터 소스 id
NOTION_STICKERS_DS=xxxxxxxx-xxxx-... # Stickers 데이터 소스 id
AUTHOR_SECRET=긴_무작위_문자열         # 작성자 키 해시용 (openssl rand -hex 32)
BOARD_PASSCODE=크루끼리만아는코드        # 입장 코드
```

`NEXT_PUBLIC_`으로 시작하는 변수는 클라이언트 번들에 그대로 들어가기 때문에, 위 변수 이름에는 절대 접두사를 붙이지 않습니다.

### 3-3. `next.config.ts`

Next.js 16의 `'use cache'`와 `cacheTag`를 쓰려면 `cacheComponents`를 켜야 합니다.

```ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  cacheComponents: true,
};

export default nextConfig;
```

### 3-4. 폴더 구조

```
app/
  layout.tsx          # 폰트(Gaegu, Nanum Pen Script, Gowun Dodum) 적용
  icon.png            # 파비콘. public/story/smile.jpg를 얼굴·상반신이 보이게 정사각형으로 자른 것(D-26)
  page.tsx            # 입장 확인 → 프레젠테이션(Story)
  rolling-paper/page.tsx  # 입장 확인 → 보드 데이터 + 내 작성자 키를 Board에 전달
  gate/page.tsx       # 입장 코드 입력 화면
  actions.ts          # Server Actions (메모 작성, 스티커 붙이기·떼기, 입장)
components/
  Story.tsx, Story.css  # 프레젠테이션(Story.dc.html) 화면
  Board.tsx           # 'use client', 프로토타입 화면과 상호작용
  NoteCard.tsx, WriteDialog.tsx, ReadDialog.tsx, StickerDock.tsx
public/story/         # 프레젠테이션 사진·영상
lib/
  notion.ts           # Notion 클라이언트(SDK 재시도), 조회 도우미
  board.ts            # 보드 조회(캐시), Notion 응답 → 도메인 타입 변환
  identity.ts         # 작성자 쿠키와 authorKey 계산
  gate.ts             # 입장 코드 확인
  schema.ts           # zod 입력 검증
  visual.ts           # id 해시 → 기울기, 핀 색
```
