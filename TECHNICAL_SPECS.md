# 기술 사양서 (Technical Specifications)

## 🎯 상용화 요구사항

### 필수 기능
- [x] 웹 반응형 디자인 (Desktop, Tablet, Mobile)
- [ ] PWA 지원 (오프라인, 홈 화면 추가)
- [ ] 소셜 로그인 (카카오, 네이버)
- [ ] 실시간 결제 시스템
- [ ] 비디오 스트리밍
- [ ] 학습 진도 관리
- [ ] 이메일 알림
- [ ] 관리자 대시보드
- [ ] SEO 최적화
- [ ] 보안 인증 (HTTPS, JWT)

### 성능 목표
- **페이지 로드 시간**: < 2초 (3G 환경)
- **First Contentful Paint**: < 1.5초
- **Time to Interactive**: < 3초
- **Lighthouse 점수**: 90점 이상 (Performance, Accessibility, Best Practices, SEO)
- **서버 응답 시간**: < 200ms
- **동시 접속자**: 1,000명 이상 처리 가능

### 브라우저 지원
- Chrome (최신 2개 버전)
- Safari (최신 2개 버전)
- Firefox (최신 2개 버전)
- Edge (최신 2개 버전)
- 모바일: iOS Safari 14+, Chrome Android 90+

---

## 📐 디자인 시스템

### 브랜드 컬러
```css
/* Primary Colors */
--brand-yellow: #FFC600;
--brand-purple: #9945FF;
--brand-pink: #E91E63;
--brand-cyan: #00D9FF;
--brand-green: #4CAF50;

/* Neutral Colors */
--gray-50: #F9FAFB;
--gray-100: #F3F4F6;
--gray-200: #E5E7EB;
--gray-300: #D1D5DB;
--gray-400: #9CA3AF;
--gray-500: #6B7280;
--gray-600: #4B5563;
--gray-700: #374151;
--gray-800: #1F2937;
--gray-900: #111827;

/* Semantic Colors */
--success: #10B981;
--warning: #F59E0B;
--error: #EF4444;
--info: #3B82F6;
```

### 타이포그래피
```css
/* Font Family */
font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;

/* Font Sizes */
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
--text-3xl: 1.875rem;  /* 30px */
--text-4xl: 2.25rem;   /* 36px */
--text-5xl: 3rem;      /* 48px */

/* Font Weights */
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

### Spacing
```css
/* Tailwind 기본 스케일 사용 */
0.5rem (8px), 1rem (16px), 1.5rem (24px), 2rem (32px), 3rem (48px), 4rem (64px)
```

### Border Radius
```css
--rounded-sm: 0.25rem;   /* 4px */
--rounded-md: 0.5rem;    /* 8px */
--rounded-lg: 1rem;      /* 16px */
--rounded-xl: 1.5rem;    /* 24px */
--rounded-2xl: 2rem;     /* 32px */
--rounded-full: 9999px;
```

### Shadow
```css
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
--shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
--shadow-2xl: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
```

### Breakpoints
```css
/* Tailwind 기본 브레이크포인트 */
sm: 640px   /* 모바일 가로, 작은 태블릿 */
md: 768px   /* 태블릿 */
lg: 1024px  /* 작은 데스크톱 */
xl: 1280px  /* 데스크톱 */
2xl: 1536px /* 큰 데스크톱 */
```

---

## 🔌 API 설계

### Base URL
```
Development: http://localhost:5000/api
Production: https://api.yourdomain.com/api
```

### 인증 헤더
```
Authorization: Bearer {access_token}
```

### 응답 형식
```typescript
// 성공
{
  "success": true,
  "data": {},
  "message": "Success"
}

// 에러
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error message",
    "details": {}
  }
}

// 페이지네이션
{
  "success": true,
  "data": {
    "items": [],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "totalPages": 5
    }
  }
}
```

### 엔드포인트 목록

#### Authentication
```
POST   /api/auth/signup           # 회원가입
POST   /api/auth/login            # 로그인
POST   /api/auth/logout           # 로그아웃
POST   /api/auth/refresh          # 토큰 갱신
POST   /api/auth/forgot-password  # 비밀번호 찾기
POST   /api/auth/reset-password   # 비밀번호 재설정
GET    /api/auth/kakao            # 카카오 로그인
GET    /api/auth/kakao/callback   # 카카오 콜백
GET    /api/auth/naver            # 네이버 로그인
GET    /api/auth/naver/callback   # 네이버 콜백
```

#### Users
```
GET    /api/users/profile         # 내 프로필 조회
PUT    /api/users/profile         # 프로필 수정
PUT    /api/users/password        # 비밀번호 변경
DELETE /api/users/account         # 회원 탈퇴
POST   /api/users/avatar          # 아바타 업로드
```

#### Courses
```
GET    /api/courses               # 강의 목록
GET    /api/courses/:id           # 강의 상세
POST   /api/courses               # 강의 생성 (관리자)
PUT    /api/courses/:id           # 강의 수정 (관리자)
DELETE /api/courses/:id           # 강의 삭제 (관리자)
POST   /api/courses/:id/like      # 강의 좋아요
GET    /api/courses/:id/reviews   # 강의 후기 목록
```

#### Lessons
```
GET    /api/lessons/:id           # 강의 콘텐츠 조회
GET    /api/lessons/:id/stream    # 비디오 스트리밍
```

#### Enrollments
```
POST   /api/enrollments           # 수강 신청
GET    /api/enrollments           # 내 수강 목록
GET    /api/enrollments/:id       # 수강 상세
PUT    /api/enrollments/:id/progress  # 진도율 업데이트
POST   /api/enrollments/:id/complete  # 강의 완료
```

#### Payments
```
POST   /api/payments/ready        # 결제 준비
POST   /api/payments/confirm      # 결제 승인
GET    /api/payments              # 결제 내역
GET    /api/payments/:id          # 결제 상세
POST   /api/payments/:id/refund   # 환불
POST   /api/payments/webhook      # 결제 웹훅
```

#### Reviews
```
POST   /api/reviews               # 후기 작성
GET    /api/reviews               # 후기 목록
PUT    /api/reviews/:id           # 후기 수정
DELETE /api/reviews/:id           # 후기 삭제
POST   /api/reviews/:id/like      # 후기 좋아요
```

#### Tests
```
GET    /api/tests/:id             # 테스트 조회
POST   /api/tests/:id/submit      # 테스트 제출
GET    /api/test-results/:id      # 테스트 결과 조회
```

#### Admin
```
GET    /api/admin/stats           # 통계
GET    /api/admin/users           # 회원 관리
PUT    /api/admin/users/:id       # 회원 정보 수정
GET    /api/admin/courses         # 강의 관리
GET    /api/admin/payments        # 결제 관리
```

#### Uploads
```
POST   /api/uploads               # 파일 업로드
POST   /api/uploads/video         # 비디오 업로드
```

---

## 🗄️ 데이터베이스 인덱스

### Users Collection
```javascript
{
  email: 1,           // unique
  providerId: 1,
  createdAt: -1
}
```

### Courses Collection
```javascript
{
  category: 1,
  price: 1,
  rating: -1,
  createdAt: -1,
  isPublished: 1
}
// Text Index for search
{
  title: 'text',
  description: 'text'
}
```

### Enrollments Collection
```javascript
{
  userId: 1,
  courseId: 1,
  enrolledAt: -1
}
// Compound Index
{
  userId: 1,
  courseId: 1
}  // unique
```

### Payments Collection
```javascript
{
  userId: 1,
  orderId: 1,         // unique
  createdAt: -1,
  status: 1
}
```

### Reviews Collection
```javascript
{
  courseId: 1,
  userId: 1,
  createdAt: -1
}
```

---

## 🔒 보안 체크리스트

### Frontend
- [ ] XSS 방어: DOMPurify로 HTML 샤니타이징
- [ ] CSRF 토큰 검증
- [ ] 민감한 정보 로컬 스토리지에 저장 금지
- [ ] API 키 환경변수로 관리
- [ ] 입력값 유효성 검사 (Zod)
- [ ] Content Security Policy (CSP) 헤더

### Backend
- [ ] JWT 토큰 만료 시간 설정 (Access: 15분, Refresh: 7일)
- [ ] 비밀번호 해싱 (bcrypt, salt rounds: 10)
- [ ] Rate Limiting (로그인: 5회/분, API: 100회/분)
- [ ] CORS 화이트리스트
- [ ] Helmet.js로 보안 헤더 설정
- [ ] SQL Injection 방어 (Mongoose ORM)
- [ ] 파일 업로드 검증 (파일 타입, 크기)
- [ ] HTTPS 강제
- [ ] 환경변수 암호화 (.env 파일 git ignore)
- [ ] 에러 메시지에 민감한 정보 노출 금지

### Database
- [ ] MongoDB Atlas IP 화이트리스트
- [ ] 데이터베이스 사용자 권한 최소화
- [ ] 백업 자동화 (일 1회)
- [ ] 연결 문자열 암호화

---

## 📊 모니터링 및 로깅

### Logging
```javascript
// Winston Logger 레벨
{
  error: 0,    // 에러
  warn: 1,     // 경고
  info: 2,     // 일반 정보
  http: 3,     // HTTP 요청
  debug: 4     // 디버그
}

// 로그 포맷
{
  timestamp: '2025-01-15T10:30:00.000Z',
  level: 'info',
  message: 'User logged in',
  userId: '123',
  ip: '192.168.1.1'
}
```

### Sentry 이벤트
- [ ] JavaScript 에러
- [ ] API 에러 (5xx)
- [ ] 결제 실패
- [ ] 로그인 실패 (3회 이상)

### Google Analytics 이벤트
```javascript
// 페이지뷰
gtag('event', 'page_view', { page_path: '/courses' });

// 커스텀 이벤트
gtag('event', 'purchase', {
  transaction_id: 'T12345',
  value: 50000,
  currency: 'KRW',
  items: [{
    item_id: 'course_123',
    item_name: '327점 커리큘럼',
    price: 50000
  }]
});

gtag('event', 'login', { method: 'kakao' });
gtag('event', 'sign_up', { method: 'email' });
gtag('event', 'video_play', { course_id: '123', lesson_id: '456' });
```

---

## 🚀 배포 환경

### Development
```
Frontend: http://localhost:5173
Backend: http://localhost:5000
Database: mongodb://localhost:27017/tepslab-dev
```

### Staging
```
Frontend: https://staging.yourdomain.com
Backend: https://api-staging.yourdomain.com
Database: MongoDB Atlas (Staging Cluster)
```

### Production
```
Frontend: https://yourdomain.com
Backend: https://api.yourdomain.com
Database: MongoDB Atlas (Production Cluster)
CDN: Cloudflare
```

### 배포 프로세스
1. 개발자가 feature 브랜치에서 작업
2. Pull Request 생성
3. CI가 자동으로 테스트 실행
4. 코드 리뷰 후 main 브랜치에 병합
5. main 브랜치 푸시 시 Staging 환경에 자동 배포
6. QA 테스트 후 Production 태그 생성
7. Production 환경에 수동 배포 (승인 필요)
8. 슬랙 알림 발송

---

## 📦 의존성 버전

### Frontend (package.json)
```json
{
  "dependencies": {
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "react-router-dom": "^6.22.0",
    "framer-motion": "^11.0.0",
    "react-icons": "^5.0.0",
    "zustand": "^4.5.0",
    "@tanstack/react-query": "^5.22.0",
    "axios": "^1.6.7",
    "react-hook-form": "^7.50.0",
    "zod": "^3.22.4",
    "video.js": "^8.10.0",
    "chart.js": "^4.4.1",
    "react-chartjs-2": "^5.2.0",
    "dompurify": "^3.0.9"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.1",
    "vite": "^5.1.0",
    "typescript": "^5.3.3",
    "tailwindcss": "^3.4.1",
    "autoprefixer": "^10.4.17",
    "postcss": "^8.4.35",
    "vitest": "^1.2.2",
    "@testing-library/react": "^14.2.1",
    "playwright": "^1.41.2"
  }
}
```

### Backend (package.json)
```json
{
  "dependencies": {
    "express": "^4.18.2",
    "mongoose": "^8.1.1",
    "bcrypt": "^5.1.1",
    "jsonwebtoken": "^9.0.2",
    "passport": "^0.7.0",
    "passport-jwt": "^4.0.1",
    "passport-kakao": "^1.0.1",
    "passport-naver-v2": "^2.0.8",
    "multer": "^1.4.5-lts.1",
    "aws-sdk": "^2.1550.0",
    "nodemailer": "^6.9.9",
    "@sendgrid/mail": "^8.1.0",
    "toss-payments-server-api": "^1.0.0",
    "winston": "^3.11.0",
    "helmet": "^7.1.0",
    "cors": "^2.8.5",
    "express-rate-limit": "^7.1.5",
    "dotenv": "^16.4.1",
    "ioredis": "^5.3.2"
  },
  "devDependencies": {
    "typescript": "^5.3.3",
    "@types/express": "^4.17.21",
    "@types/node": "^20.11.16",
    "jest": "^29.7.0",
    "supertest": "^6.3.4",
    "mongodb-memory-server": "^9.1.6",
    "nodemon": "^3.0.3",
    "ts-node": "^10.9.2"
  }
}
```

---

## ⚡ 성능 최적화 체크리스트

### Frontend
- [ ] 코드 스플리팅 (React.lazy)
- [ ] Tree Shaking 설정
- [ ] 번들 크기 분석 (< 300KB gzipped)
- [ ] Lazy Loading 이미지
- [ ] WebP 이미지 포맷
- [ ] 폰트 서브셋팅
- [ ] CSS-in-JS 최적화 (Tailwind 퍼지)
- [ ] 메모이제이션 (React.memo, useMemo, useCallback)
- [ ] Virtual Scrolling (react-window)
- [ ] Service Worker 캐싱

### Backend
- [ ] MongoDB 인덱스 최적화
- [ ] Redis 캐싱
- [ ] API 응답 압축 (gzip)
- [ ] Connection Pooling
- [ ] N+1 쿼리 방지
- [ ] 페이지네이션
- [ ] CDN 사용

### Database
- [ ] 적절한 인덱스 설정
- [ ] 쿼리 성능 분석 (explain)
- [ ] 데이터 정규화
- [ ] 샤딩 (필요 시)

---

## 🧪 테스트 커버리지 목표

- **Overall**: 80% 이상
- **Services/Controllers**: 90% 이상
- **Components**: 70% 이상
- **Utils**: 95% 이상

---

## 📱 모바일 앱 (Future)

### React Native
- **플랫폼**: iOS, Android
- **공유 코드**: API 클라이언트, 비즈니스 로직
- **네이티브 기능**: 푸시 알림, 파일 다운로드, 오프라인 모드
- **배포**: App Store, Google Play

---

이 기술 사양서를 기반으로 상용화 수준의 플랫폼을 구축합니다.
