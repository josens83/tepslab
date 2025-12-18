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

## 디자인 시스템

### 사용 가능한 컴포넌트
새로 만들지 말고 기존 컴포넌트를 사용하세요:

```
src/components/common/
├── Button.tsx       - 버튼 (variant: primary, secondary, outline)
├── Card.tsx         - 카드 컨테이너
├── Input.tsx        - 텍스트 입력
├── Textarea.tsx     - 멀티라인 입력
├── Modal.tsx        - 모달/다이얼로그
├── Toast.tsx        - 알림 토스트
├── LoadingSpinner.tsx - 로딩 인디케이터
├── LazyImage.tsx    - 이미지 (지연 로딩)
├── Logo.tsx         - 로고
└── ProtectedRoute.tsx - 인증 필요 라우트
```

### Import 경로
```tsx
// ✅ 올바른 import
import { Button, Card, Input } from '@/components/common';

// ❌ 잘못된 import - 직접 구현 금지
import Button from './MyButton';
```

### 브랜드 색상 (Tailwind)
```
brand-yellow: #FFC600  → bg-brand-yellow, text-brand-yellow
brand-cyan:   #00D9FF  → bg-brand-cyan, text-brand-cyan
brand-purple: #9945FF  → bg-brand-purple, text-brand-purple
brand-pink:   #E91E63  → bg-brand-pink, text-brand-pink
brand-green:  #4CAF50  → bg-brand-green, text-brand-green
```

### 버튼 스타일
```tsx
// 기본 스타일 클래스
className="btn-primary"           // 기본 버튼 스타일
className="btn-primary btn-yellow" // 노란색 버튼
className="btn-primary btn-purple" // 보라색 버튼
className="btn-primary btn-cyan"   // 청록색 버튼
```

### 카드 스타일
```tsx
// 기본 카드
<div className="card">...</div>  // 흰 배경, 라운드, 그림자, 호버 효과
```

### 반응형 디자인 (Mobile-First 철칙)

#### 브레이크포인트
```
Mobile: default (< 640px)   - 기본값, 항상 먼저 작성
Tablet: sm (640px), md (768px)
Desktop: lg (1024px), xl (1280px), 2xl (1536px)
```

#### Mobile-First 규칙
```tsx
// ✅ 올바른 순서 (모바일 → 태블릿 → 데스크톱)
className="w-full sm:w-1/2 lg:w-1/3"
className="text-sm md:text-base lg:text-lg"
className="p-4 md:p-6 lg:p-8"
className="flex flex-col md:flex-row"

// ❌ 잘못된 순서 (데스크톱 → 모바일)
className="w-1/3 lg:w-full"
className="flex-row md:flex-col"
```

#### 터치 타겟 사이즈
```tsx
// ✅ 모바일 터치 영역 최소 44x44px
className="min-h-[44px] min-w-[44px]"
className="p-3"  // 패딩으로 터치 영역 확보

// ❌ 터치하기 어려운 작은 버튼
className="p-1 text-xs"
```

#### 반응형 그리드 패턴
```tsx
// 카드 그리드 (1열 → 2열 → 3열)
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
  {items.map(item => <Card key={item.id} />)}
</div>

// 사이드바 레이아웃 (모바일: 숨김, 데스크톱: 표시)
<div className="hidden lg:block lg:w-64">사이드바</div>
<main className="w-full lg:ml-64">메인 콘텐츠</main>
```

#### 반응형 타이포그래피
```tsx
// 제목: 모바일 작게 → 데스크톱 크게
<h1 className="text-2xl md:text-3xl lg:text-4xl font-bold">제목</h1>

// 본문: 모바일 최적화
<p className="text-sm md:text-base leading-relaxed">본문</p>
```

#### 반응형 이미지
```tsx
// 컨테이너에 맞게 조절
<img
  src="..."
  alt="설명"
  className="w-full h-auto object-cover"
/>

// aspect-ratio 유지
<div className="aspect-video">
  <img src="..." alt="..." className="w-full h-full object-cover" />
</div>
```

#### 모바일 네비게이션 패턴
```tsx
// 데스크톱: 가로 메뉴, 모바일: 햄버거 메뉴
<nav className="hidden md:flex gap-4">가로 메뉴</nav>
<button className="md:hidden" aria-label="메뉴 열기">
  <MenuIcon />
</button>
```

### 폰트
- 기본 폰트: Pretendard (한글 최적화)
- `font-sans` 클래스 사용

## UI 상태 패턴 (필수 구현)

모든 데이터 페칭 컴포넌트는 4가지 상태를 반드시 구현해야 합니다.

### 1. 로딩 상태 (Loading State)

#### Skeleton UI vs Spinner 사용 기준
```tsx
// Skeleton UI: 레이아웃이 예측 가능한 경우 (리스트, 카드, 프로필)
<div className="animate-pulse space-y-4">
  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
  <div className="h-32 bg-gray-200 rounded"></div>
</div>

// Spinner: 레이아웃 예측 불가능, 전체 페이지 로딩, 버튼 내부
import { LoadingSpinner } from '@/components/common';
if (isLoading) return <LoadingSpinner />;

// 버튼 내 로딩
<Button disabled={isSubmitting}>
  {isSubmitting ? <LoadingSpinner size="sm" /> : '제출'}
</Button>
```

#### Skeleton 컴포넌트 패턴
```tsx
// 카드 스켈레톤
const CardSkeleton = () => (
  <div className="card animate-pulse">
    <div className="h-40 bg-gray-200 rounded-t-lg"></div>
    <div className="p-4 space-y-3">
      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
    </div>
  </div>
);

// 리스트 스켈레톤
const ListSkeleton = ({ count = 5 }: { count?: number }) => (
  <div className="space-y-3">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="h-16 bg-gray-200 rounded animate-pulse"></div>
    ))}
  </div>
);
```

### 2. 에러 상태 (Error State)

```tsx
// 기본 에러 컴포넌트
interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

const ErrorState = ({
  message = '데이터를 불러오는데 실패했습니다',
  onRetry
}: ErrorStateProps) => (
  <div className="text-center py-12">
    <div className="text-red-500 text-5xl mb-4">⚠️</div>
    <p className="text-gray-600 mb-4">{message}</p>
    {onRetry && (
      <Button onClick={onRetry} variant="outline">
        다시 시도
      </Button>
    )}
  </div>
);

// 사용 예시
if (error) return <ErrorState message={error.message} onRetry={refetch} />;
```

### 3. 빈 상태 (Empty State)

```tsx
// 기본 빈 상태 컴포넌트
interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const EmptyState = ({ icon = '📭', title, description, action }: EmptyStateProps) => (
  <div className="text-center py-12">
    <div className="text-5xl mb-4">{icon}</div>
    <h3 className="text-lg font-semibold text-gray-800 mb-2">{title}</h3>
    {description && <p className="text-gray-500 mb-4">{description}</p>}
    {action && (
      <Button onClick={action.onClick}>{action.label}</Button>
    )}
  </div>
);

// 사용 예시
if (data.length === 0) return (
  <EmptyState
    icon="📚"
    title="학습 기록이 없습니다"
    description="첫 번째 학습을 시작해보세요!"
    action={{ label: '학습 시작', onClick: () => navigate('/courses') }}
  />
);
```

### 4. 성공 상태 (Success Feedback)

```tsx
// Toast 사용
import { toast } from '@/components/common/Toast';

// 성공 알림
toast.success('저장되었습니다');

// 에러 알림
toast.error('저장에 실패했습니다');

// 정보 알림
toast.info('자동 저장되었습니다');

// 폼 제출 성공 후 패턴
const handleSubmit = async (data: FormData) => {
  try {
    await submitData(data);
    toast.success('제출 완료!');
    navigate('/success');
  } catch (err) {
    const error = err as Error;
    toast.error(error.message || '제출에 실패했습니다');
  }
};
```

### 전체 구현 패턴

```tsx
const DataList = () => {
  const { data, isLoading, error, refetch } = useQuery();

  // 1. 로딩 상태
  if (isLoading) return <ListSkeleton count={5} />;

  // 2. 에러 상태
  if (error) return <ErrorState message={error.message} onRetry={refetch} />;

  // 3. 빈 상태
  if (!data || data.length === 0) return (
    <EmptyState
      title="데이터가 없습니다"
      action={{ label: '새로 만들기', onClick: handleCreate }}
    />
  );

  // 4. 성공 상태 (데이터 표시)
  return (
    <ul className="space-y-4">
      {data.map(item => (
        <li key={item.id} className="card p-4">{item.title}</li>
      ))}
    </ul>
  );
};
```

### 접근성 필수:
- 모든 `<img>`에 의미 있는 `alt` 텍스트
- 모든 폼 요소에 `<label>` 연결
- 버튼에 명확한 텍스트 또는 `aria-label`
- 키보드로 모든 기능 사용 가능

### 금지 사항:
- ❌ 하드코딩된 색상값 (예: `bg-blue-500`)
- ❌ 인라인 스타일 (`style={{}}`)
- ❌ 기존 컴포넌트 있는데 새로 구현
- ❌ label 없는 input
- ❌ alt 없는 img

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
