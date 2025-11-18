# 프리미엄 학습 플랫폼 아키텍처 설계

## 📋 프로젝트 개요

consulteps.com을 벤치마킹한 프리미엄 온라인 학습 플랫폼
- **목표**: 웹, 모바일, 앱에서 즉시 상용화 가능한 수준의 플랫폼 구축
- **핵심 기능**: 온라인 강의, 결제, 학습 관리, 소셜 로그인

---

## 🏗️ 기술 스택

### Frontend
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: Zustand / React Query
- **Routing**: React Router v6
- **Animation**: Framer Motion
- **Form Handling**: React Hook Form + Zod
- **API Client**: Axios
- **Video Player**: Video.js / React Player

### Backend
- **Runtime**: Node.js 20+
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB + Mongoose
- **Cache**: Redis
- **Authentication**: JWT + Passport.js
- **File Storage**: AWS S3 / Cloudinary
- **Email**: Nodemailer + SendGrid
- **Payment**: TossPayments / PortOne(아임포트)

### DevOps & Infrastructure
- **Containerization**: Docker + Docker Compose
- **CI/CD**: GitHub Actions
- **Hosting**:
  - Frontend: Vercel / Netlify
  - Backend: AWS EC2 / Railway
  - Database: MongoDB Atlas
- **CDN**: Cloudflare / AWS CloudFront
- **Monitoring**: Sentry, Google Analytics

### Mobile
- **PWA**: Vite PWA Plugin
- **Future**: React Native (앱 출시 시)

---

## 🗂️ 프로젝트 구조

```
tepslab/
├── client/                 # Frontend (React)
│   ├── public/
│   │   ├── icons/         # PWA 아이콘
│   │   └── images/        # 정적 이미지
│   ├── src/
│   │   ├── api/           # API 클라이언트
│   │   ├── assets/        # 로고, 아이콘, 폰트
│   │   ├── components/    # 재사용 컴포넌트
│   │   │   ├── common/    # 버튼, 카드, 모달 등
│   │   │   ├── layout/    # Header, Footer, Sidebar
│   │   │   └── sections/  # 페이지 섹션
│   │   ├── contexts/      # React Context
│   │   ├── hooks/         # Custom Hooks
│   │   ├── pages/         # 페이지 컴포넌트
│   │   ├── store/         # Zustand 스토어
│   │   ├── types/         # TypeScript 타입
│   │   ├── utils/         # 유틸리티 함수
│   │   └── App.tsx
│   └── package.json
│
├── server/                # Backend (Node.js/Express)
│   ├── src/
│   │   ├── config/        # 설정 파일
│   │   ├── controllers/   # 요청 처리
│   │   ├── middleware/    # 미들웨어
│   │   ├── models/        # MongoDB 스키마
│   │   ├── routes/        # API 라우트
│   │   ├── services/      # 비즈니스 로직
│   │   ├── utils/         # 유틸리티
│   │   └── server.ts
│   ├── tests/            # 테스트 파일
│   └── package.json
│
├── docker-compose.yml    # Docker 설정
└── README.md
```

---

## 📱 주요 페이지 및 기능

### 1. 랜딩 페이지 (/)
- **히어로 섹션**: 메인 카피 + CTA 버튼
- **커리큘럼 섹션**: 점수대별 맞춤형 커리큘럼 (327점, 387점, 450점, 550점, 노베이스)
- **후기 섹션**: 실제 수강생 점수 향상 후기 (카드 슬라이더)
- **소개 섹션**: 컨설팀스 소개, 강사 소개
- **푸터**: 사업자 정보, 연락처, SNS 링크

### 2. 인증 페이지
- **로그인** (`/login`)
  - 이메일/비밀번호 로그인
  - 소셜 로그인 (카카오, 네이버)
  - 자동 로그인 옵션
- **회원가입** (`/signup`)
  - 기본 정보 입력 (이름, 이메일, 비밀번호)
  - 약관 동의
  - 이메일 인증
- **비밀번호 찾기** (`/forgot-password`)

### 3. 강의 페이지
- **강의 목록** (`/courses`)
  - 필터링: 점수대, 카테고리, 가격
  - 검색 기능
  - 정렬: 인기순, 최신순, 가격순
- **강의 상세** (`/courses/:id`)
  - 강의 소개, 커리큘럼, 강사 정보
  - 수강생 후기 및 평점
  - 결제 버튼
- **강의 수강** (`/learn/:courseId/:lessonId`)
  - 비디오 플레이어 (진도율 저장)
  - 강의 자료 다운로드
  - 다음/이전 강의 이동

### 4. 학습 대시보드 (나의 강의실)
- **내 강의** (`/dashboard/courses`)
  - 수강 중인 강의 목록
  - 진도율 표시
- **학습 통계** (`/dashboard/stats`)
  - 학습 시간, 완강률
  - 점수 추이 그래프
- **진단 테스트** (`/dashboard/test`)
  - 레벨 테스트 응시
  - 결과 분석

### 5. 마이페이지
- **프로필 관리** (`/profile`)
  - 개인정보 수정
  - 비밀번호 변경
- **수강 내역** (`/profile/enrollments`)
- **결제 내역** (`/profile/payments`)
  - 영수증 다운로드

### 6. 결제 페이지
- **결제** (`/checkout/:courseId`)
  - 강의 정보 확인
  - 결제 수단 선택 (카드, 계좌이체, 간편결제)
  - 쿠폰/할인 적용
- **결제 완료** (`/checkout/success`)
  - 결제 확인
  - 수강 시작 버튼

### 7. 관리자 페이지
- **대시보드** (`/admin`)
  - 매출 통계, 회원 수, 수강 통계
- **강의 관리** (`/admin/courses`)
  - 강의 CRUD
  - 강의 영상 업로드
- **회원 관리** (`/admin/users`)
  - 회원 목록, 검색, 상태 관리
- **결제 관리** (`/admin/payments`)
  - 결제 내역, 환불 처리

---

## 🔐 인증 및 보안

### JWT 인증 전략
```
1. 로그인 → Access Token (15분) + Refresh Token (7일) 발급
2. Access Token을 헤더에 포함하여 API 요청
3. Access Token 만료 시 Refresh Token으로 갱신
4. Refresh Token도 만료 시 재로그인
```

### 소셜 로그인 플로우
```
1. 프론트엔드에서 OAuth 버튼 클릭
2. 카카오/네이버 인증 페이지로 리다이렉트
3. 인증 성공 → 백엔드로 code 전송
4. 백엔드에서 Access Token 발급 및 사용자 정보 조회
5. DB에 사용자 저장 또는 업데이트
6. JWT 토큰 발급 및 프론트엔드로 전달
```

### 보안 체크리스트
- [ ] HTTPS 강제 사용
- [ ] XSS 방어 (DOMPurify, CSP 헤더)
- [ ] CSRF 방어 (CSRF 토큰)
- [ ] SQL Injection 방어 (Mongoose 사용)
- [ ] Rate Limiting (express-rate-limit)
- [ ] 환경변수 암호화 (.env 파일)
- [ ] 비밀번호 해싱 (bcrypt)
- [ ] 파일 업로드 검증 (파일 크기, 확장자)

---

## 💳 결제 시스템

### TossPayments 통합
```typescript
// 결제 요청
const payment = await TossPayments.requestPayment({
  amount: course.price,
  orderId: generateOrderId(),
  orderName: course.title,
  customerName: user.name,
  successUrl: `${process.env.CLIENT_URL}/checkout/success`,
  failUrl: `${process.env.CLIENT_URL}/checkout/fail`,
});

// 결제 승인 (서버)
const result = await TossPayments.confirmPayment({
  paymentKey,
  orderId,
  amount,
});

// DB에 결제 정보 저장
await Payment.create({
  userId,
  courseId,
  amount,
  paymentKey,
  status: 'completed',
});
```

---

## 📊 데이터베이스 스키마

### User (사용자)
```javascript
{
  _id: ObjectId,
  email: String (unique),
  password: String (hashed),
  name: String,
  phone: String,
  provider: String, // 'local', 'kakao', 'naver'
  providerId: String,
  role: String, // 'student', 'admin'
  avatar: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Course (강의)
```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  thumbnail: String,
  price: Number,
  category: String, // '327점', '387점', '450점', '550점', '노베이스'
  instructor: ObjectId (ref: User),
  lessons: [ObjectId (ref: Lesson)],
  reviews: [ObjectId (ref: Review)],
  rating: Number,
  enrollmentCount: Number,
  isPublished: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Lesson (강의 콘텐츠)
```javascript
{
  _id: ObjectId,
  courseId: ObjectId (ref: Course),
  title: String,
  description: String,
  videoUrl: String,
  duration: Number, // 초 단위
  materials: [String], // 자료 URL
  order: Number,
  isFree: Boolean,
  createdAt: Date
}
```

### Enrollment (수강 신청)
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  courseId: ObjectId (ref: Course),
  progress: Number, // 0-100
  completedLessons: [ObjectId (ref: Lesson)],
  lastAccessedAt: Date,
  enrolledAt: Date
}
```

### Payment (결제)
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  courseId: ObjectId (ref: Course),
  amount: Number,
  paymentKey: String,
  orderId: String,
  status: String, // 'pending', 'completed', 'failed', 'refunded'
  method: String, // 'card', 'transfer', 'toss'
  paidAt: Date,
  createdAt: Date
}
```

### Review (후기)
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  courseId: ObjectId (ref: Course),
  rating: Number, // 1-5
  beforeScore: Number,
  afterScore: Number,
  content: String,
  createdAt: Date
}
```

---

## 🚀 성능 최적화 전략

### Frontend
1. **코드 스플리팅**
   - React.lazy() + Suspense로 페이지별 분할
   - 동적 import로 번들 크기 축소

2. **이미지 최적화**
   - WebP 포맷 사용
   - Lazy Loading (react-lazyload)
   - 반응형 이미지 (srcset)

3. **캐싱 전략**
   - React Query로 서버 상태 캐싱
   - Service Worker로 정적 자산 캐싱

4. **성능 모니터링**
   - Lighthouse CI
   - Web Vitals 추적

### Backend
1. **데이터베이스 최적화**
   - 인덱스 설정 (email, courseId 등)
   - MongoDB Aggregation Pipeline
   - 커넥션 풀링

2. **캐싱**
   - Redis로 자주 조회되는 데이터 캐싱
   - API 응답 캐싱

3. **파일 처리**
   - CDN 사용 (이미지, 비디오)
   - 스트리밍 방식 비디오 제공

---

## 📱 모바일 최적화

### 반응형 디자인
- Tailwind CSS 브레이크포인트 활용
- Mobile-First 접근
- 터치 제스처 지원

### PWA 기능
- Offline 지원
- 푸시 알림
- 홈 화면 추가
- 빠른 로딩 (Service Worker)

---

## 🧪 테스트 전략

### Frontend
- **Unit Test**: Vitest + React Testing Library
- **E2E Test**: Playwright
- **Coverage**: 80% 이상 목표

### Backend
- **Unit Test**: Jest + Supertest
- **Integration Test**: MongoDB Memory Server
- **API Test**: Postman Collection

---

## 📈 배포 전략

### 환경 구성
1. **Development**: 로컬 개발 환경
2. **Staging**: 테스트 환경 (배포 전 검증)
3. **Production**: 실제 운영 환경

### CI/CD 파이프라인
```yaml
# GitHub Actions
1. 코드 푸시
2. 린트 및 테스트 실행
3. 빌드
4. Docker 이미지 생성
5. 배포 (Vercel/Railway)
6. 슬랙 알림
```

### 롤백 전략
- Git 태그를 통한 버전 관리
- 이전 버전으로 즉시 롤백 가능

---

## 📋 개발 우선순위

### Phase 1: MVP (4주)
1. ✅ 프로젝트 초기 설정
2. 프론트엔드 공통 컴포넌트 및 레이아웃
3. 랜딩 페이지 개발
4. 인증 시스템 (로그인/회원가입)
5. 강의 목록 및 상세 페이지
6. 기본 결제 기능

### Phase 2: 핵심 기능 (3주)
7. 학습 대시보드 (나의 강의실)
8. 비디오 플레이어 및 진도율 관리
9. 소셜 로그인 통합
10. 마이페이지 (프로필, 수강/결제 내역)
11. 모바일 반응형 디자인

### Phase 3: 고급 기능 (2주)
12. 관리자 페이지
13. 진단 테스트 시스템
14. 이메일 알림
15. SEO 최적화
16. PWA 설정

### Phase 4: 배포 및 최적화 (1주)
17. 성능 최적화
18. 보안 강화
19. 테스트 작성
20. Docker 및 CI/CD 설정
21. 프로덕션 배포

---

## 🔧 환경 변수

### Client (.env)
```env
VITE_API_URL=http://localhost:5000/api
VITE_KAKAO_APP_KEY=your_kakao_key
VITE_NAVER_CLIENT_ID=your_naver_id
VITE_TOSS_CLIENT_KEY=your_toss_key
```

### Server (.env)
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/tepslab
REDIS_URL=redis://localhost:6379
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
AWS_S3_BUCKET=your_bucket
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
KAKAO_CLIENT_ID=your_kakao_id
KAKAO_CLIENT_SECRET=your_kakao_secret
NAVER_CLIENT_ID=your_naver_id
NAVER_CLIENT_SECRET=your_naver_secret
TOSS_SECRET_KEY=your_toss_key
SENDGRID_API_KEY=your_sendgrid_key
```

---

## 📞 서비스 통합

### 필수 서드파티 서비스
1. **MongoDB Atlas**: 데이터베이스 호스팅
2. **AWS S3 / Cloudinary**: 파일 저장소
3. **TossPayments**: 결제 처리
4. **Kakao/Naver OAuth**: 소셜 로그인
5. **SendGrid**: 이메일 발송
6. **Sentry**: 에러 추적
7. **Google Analytics**: 사용자 분석

---

## 🎯 성공 지표 (KPI)

1. **기술적 지표**
   - 페이지 로딩 속도 < 2초
   - Lighthouse 점수 > 90점
   - 테스트 커버리지 > 80%
   - 서버 응답 시간 < 200ms

2. **비즈니스 지표**
   - 회원가입 전환율
   - 결제 완료율
   - 강의 완강률
   - 재구매율

---

이 아키텍처를 기반으로 단계별로 개발을 진행하겠습니다.
