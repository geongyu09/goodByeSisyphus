## 9. 배포

이 프로젝트는 Vercel에 배포합니다. Netlify 내용은 대안으로 남겨 둡니다.

### Vercel

1. GitHub 저장소를 Vercel에 연결하면 Next.js를 자동으로 인식해서 Server Action과 페이지를 서버리스 함수로 배포합니다.
2. **Settings → Environment Variables**에 3-2의 변수를 모두 넣고, Production과 Preview 환경을 구분하고 싶다면 Preview용 Notion 데이터베이스를 따로 만듭니다.
3. Hobby(무료) 요금제는 비상업적 개인 프로젝트용이므로, 롤링페이퍼 용도로 쓰기에 적합합니다.

### Netlify

이미 연결된 Netlify를 쓰고 싶다면 Next.js 런타임 어댑터가 자동으로 적용되며, 환경 변수를 같은 방식으로 등록하면 됩니다. `'use cache'`와 태그 무효화 같은 최신 캐시 기능은 호스팅마다 지원 시점이 다를 수 있으므로, 배포 후 메모를 써 보고 다른 브라우저에서 보이는지 꼭 확인합니다.
