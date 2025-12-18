# TepsLab - AI 컨텍스트 문서

## 프로젝트 개요

TepsLab은 TEPS(Test of English Proficiency developed by Seoul National University) 시험 준비를 위한 프리미엄 온라인 학습 플랫폼입니다.

### 핵심 가치
- **점수대별 맞춤 학습**: 327점, 387점, 450점, 550점 목표별 커리큘럼
- **데이터 기반 학습**: 학습 진도 추적 및 취약점 분석
- **접근성**: 모바일/데스크톱 반응형, PWA 지원

## 기술 스택

### Frontend (client/)
- **Framework**: React 19 + TypeScript
- **Build Tool**: Vite 7
- **Styling**: Tailwind CSS
- **State**: Zustand
- **Router**: React Router v7
- **Animation**: Framer Motion
- **Testing**: Vitest, Playwright

### Backend (Supabase Direct)
- **Database**: Supabase PostgreSQL
- **Auth**: Supabase Auth (Google, Kakao, GitHub OAuth)
- **Storage**: Supabase Storage
- **Edge Functions**: Supabase Edge Functions (결제 처리 등)

### Deployment
- **Frontend**: Vercel
- **Backend**: Supabase Cloud

## 디렉토리 구조

```
tepslab/
├── client/                 # React Frontend
│   ├── src/
│   │   ├── components/    # 재사용 컴포넌트
│   │   │   ├── common/    # 공통 UI (Logo, Header, Footer)
│   │   │   ├── home/      # 홈페이지 섹션
│   │   │   └── payment/   # 결제 관련
│   │   ├── contexts/      # React Context (AuthContext)
│   │   ├── hooks/         # Custom Hooks
│   │   ├── lib/           # 유틸리티 (supabase.ts)
│   │   ├── pages/         # 페이지 컴포넌트
│   │   ├── stores/        # Zustand 스토어
│   │   └── types/         # TypeScript 타입 정의
│   └── public/            # 정적 파일
├── supabase/              # Supabase 설정
│   ├── functions/         # Edge Functions
│   └── migrations/        # DB 마이그레이션 SQL
└── .github/workflows/     # CI/CD 파이프라인
```

## 주요 파일 설명

### 인증 시스템
- `client/src/contexts/AuthContext.tsx`: Supabase Auth 컨텍스트
- `client/src/hooks/useAuth.ts`: AuthContext 훅 re-export
- `client/src/pages/LoginPage.tsx`: 로그인 (이메일/소셜)
- `client/src/pages/RegisterPage.tsx`: 회원가입

### 데이터베이스
- `client/src/lib/supabase.ts`: Supabase 클라이언트 설정
- `supabase/migrations/000_create_tables.sql`: 테이블 스키마

### 결제
- `client/src/components/payment/`: Toss Payments 연동

## 개발 명령어

```bash
# 개발 서버
cd client && npm run dev

# 타입 체크
npm run typecheck

# 린트
npm run lint

# 빌드 전 전체 검증
npm run verify

# 테스트
npm run test
npm run test:e2e
```

## 환경 변수

### Vercel (Production)
```
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxx
VITE_TOSS_CLIENT_KEY=xxx
VITE_SENTRY_DSN=xxx
```

## 코딩 컨벤션

### TypeScript
- `strict: true` 모드 사용
- `forceConsistentCasingInFileNames: true` (대소문자 엄격)
- `noImplicitAny: true` (암시적 any 금지)
- Path alias: `@/` → `./src/`

### 컴포넌트 구조
```typescript
// 함수형 컴포넌트 + TypeScript
interface Props {
  title: string;
  onClick?: () => void;
}

export const MyComponent = ({ title, onClick }: Props) => {
  return <div onClick={onClick}>{title}</div>;
};
```

### 상태 관리
- 전역 상태: Zustand
- 인증 상태: AuthContext (Supabase)
- 서버 상태: Supabase 클라이언트 직접 호출

## 자주 하는 실수 방지

### 배포 오류
1. import 경로 대소문자 확인 (Linux는 대소문자 구분)
2. `npm run typecheck` 실행 후 커밋
3. 환경 변수 Vercel 대시보드에 등록 확인

### Supabase 연동
1. RLS 정책 확인 (Row Level Security)
2. Auth 설정의 Site URL, Redirect URL 확인
3. 테이블 생성 후 타입 재생성 필요 시 확인

## 현재 진행 상황

### 완료
- [x] React + Vite 프로젝트 설정
- [x] Supabase 연동 (Auth, Database)
- [x] 기본 페이지 구현 (Home, Login, Register)
- [x] Vercel 배포 설정
- [x] PWA 설정
- [x] TypeScript strict mode 적용
- [x] CI/CD 파이프라인 (GitHub Actions)
- [x] Pre-commit hook (Husky)

### 진행 중
- [ ] 결제 시스템 테스트
- [ ] 학습 콘텐츠 페이지 구현
- [ ] 대시보드 구현

## AI에게 요청 시 참고사항

1. **변경 전 확인**: 파일 수정 전 반드시 현재 내용 확인
2. **테스트**: 변경 후 `npm run typecheck` 실행 권장
3. **커밋 단위**: 기능 단위로 작은 커밋 유지
4. **브랜치**: `claude/` 접두사 브랜치에서 작업
