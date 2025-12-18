# TepsLab 배포 체크리스트

## 배포 전 검증 체크리스트

### TypeScript 검증
- [ ] `npm run typecheck` 통과
- [ ] import 경로 대소문자 확인 (Linux 대소문자 구분)
- [ ] 암시적 any 타입 없음
- [ ] null/undefined 처리 완료

### 코드 품질
- [ ] `npm run lint` 통과
- [ ] 미사용 변수/import 제거
- [ ] console.log 제거 (프로덕션)

### 빌드 검증
- [ ] `npm run build` 로컬에서 성공
- [ ] 또는 `npm run verify` 전체 검증 통과

### 환경 변수
- [ ] Vercel 대시보드에 환경변수 등록
  - [ ] VITE_SUPABASE_URL
  - [ ] VITE_SUPABASE_ANON_KEY
  - [ ] VITE_TOSS_CLIENT_KEY (결제 사용 시)
  - [ ] VITE_SENTRY_DSN (에러 추적 사용 시)

### Supabase 설정
- [ ] 테이블 생성 완료
- [ ] RLS 정책 설정 완료
- [ ] Auth 설정
  - [ ] Site URL: https://tepslab.vercel.app
  - [ ] Redirect URLs: https://tepslab.vercel.app/auth/callback
- [ ] OAuth Provider 설정 (필요 시)
  - [ ] Google
  - [ ] Kakao
  - [ ] GitHub

## 배포 후 검증 체크리스트

### 기능 테스트
- [ ] 홈페이지 로딩
- [ ] 회원가입 동작
- [ ] 로그인 동작
- [ ] 소셜 로그인 동작
- [ ] 로그아웃 동작

### 성능 체크
- [ ] Lighthouse 점수 확인 (목표: 90+)
- [ ] Core Web Vitals 확인
  - [ ] LCP < 2.5s
  - [ ] FID < 100ms
  - [ ] CLS < 0.1

### 보안 체크
- [ ] HTTPS 적용 확인
- [ ] 보안 헤더 확인 (X-Frame-Options 등)
- [ ] API 키가 노출되지 않는지 확인

## 주간 점검 루틴

### 월요일
- [ ] 의존성 보안 취약점 확인 (`npm audit`)
- [ ] Supabase 대시보드 확인 (사용량, 에러)

### 금요일
- [ ] 배포 로그 검토
- [ ] 사용자 피드백 검토
- [ ] 다음 주 작업 계획

## 개발 명령어 모음

```bash
# 개발 서버 시작
cd client && npm run dev

# 타입 체크만
npm run typecheck

# 린트만
npm run lint

# 전체 검증 (타입체크 + 린트 + 빌드)
npm run verify

# 테스트
npm run test

# E2E 테스트
npm run test:e2e

# 프로덕션 빌드 미리보기
npm run preview
```

## 문제 해결 가이드

### "Cannot find module" 오류
1. import 경로 대소문자 확인
2. `node_modules` 삭제 후 재설치
3. TypeScript 서버 재시작 (VSCode: Ctrl+Shift+P → Restart TS Server)

### Vercel 배포 실패
1. 로컬에서 `npm run verify` 실행
2. 환경변수 확인
3. Vercel 빌드 로그 확인

### Supabase 연결 오류
1. 환경변수 확인 (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)
2. RLS 정책 확인
3. 네트워크/CORS 확인
