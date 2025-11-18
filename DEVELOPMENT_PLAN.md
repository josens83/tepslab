# 개발 세부 실행 계획

## 📅 전체 일정: 10주 (약 2.5개월)

---

## Phase 1: MVP 개발 (4주)

### Week 1: 프로젝트 기반 구축

#### Day 1-2: Frontend 공통 컴포넌트
- [ ] Button 컴포넌트 (5가지 색상 variant)
- [ ] Card 컴포넌트
- [ ] Input/Textarea 컴포넌트
- [ ] Modal 컴포넌트
- [ ] Loading Spinner
- [ ] Toast/Alert 컴포넌트
- [ ] 컴포넌트 Storybook 문서화

#### Day 3-4: 레이아웃 시스템
- [ ] Header 컴포넌트
  - 로고, 네비게이션 메뉴
  - 로그인/회원가입 버튼
  - 사용자 드롭다운 메뉴
  - 모바일 햄버거 메뉴
- [ ] Footer 컴포넌트
  - 사업자 정보
  - 연락처, 이메일
  - SNS 링크 (유튜브, 페이스북, 인스타그램)
  - 이용약관, 개인정보처리방침
- [ ] Sidebar (관리자용)

#### Day 5-7: 랜딩 페이지
- [ ] Hero Section
  - 메인 카피: "텝스, 필요한 점수만큼만 공부하세요"
  - 서브 카피: "텝스는 점수대에 따라 필요한 공부가 완전히 달라집니다"
  - CTA 버튼 (수강신청)
  - 배경 애니메이션
- [ ] 상단 알림 배너 (청록색)
  - "이번에 올라온 점수 달성 후기 보러가기 →"
- [ ] 커리큘럼 섹션
  - 5개 버튼 그리드 (327점, 387점, 450점, 550점, 노베이스)
  - 각 버튼 hover 효과 및 애니메이션
  - 클릭 시 해당 강의 페이지로 이동
- [ ] 수강생 후기 섹션
  - "매 시험 추가되는 점수 달성자" 타이틀
  - 점수대별 탭 (300점대, 450점 이상, 500점대 초고득점)
  - 후기 카드 (이름, 날짜, 점수 변화, 리뷰 이미지)
  - 가로 스크롤 슬라이더
- [ ] 소개 섹션
  - 컨설팀스 소개
  - 강사 소개
- [ ] FAQ 섹션 (선택사항)
- [ ] 반응형 디자인 적용

---

### Week 2: 백엔드 초기 설정 + 인증 시스템

#### Day 1-2: Backend 프로젝트 설정
- [ ] Express.js + TypeScript 설정
- [ ] MongoDB 연결 설정
- [ ] Redis 설정 (선택사항)
- [ ] 환경변수 관리 (.env)
- [ ] 에러 핸들링 미들웨어
- [ ] 로깅 시스템 (winston)
- [ ] CORS 설정
- [ ] 헬스체크 엔드포인트 (`/health`)

#### Day 3-5: 인증 시스템 구현
**Backend:**
- [ ] User 모델 정의
- [ ] 회원가입 API (`POST /api/auth/signup`)
  - 이메일 중복 체크
  - 비밀번호 해싱 (bcrypt)
  - 이메일 인증 토큰 생성
- [ ] 로그인 API (`POST /api/auth/login`)
  - JWT Access Token + Refresh Token 발급
  - 쿠키 설정
- [ ] 로그아웃 API (`POST /api/auth/logout`)
- [ ] 토큰 갱신 API (`POST /api/auth/refresh`)
- [ ] 인증 미들웨어 (JWT 검증)
- [ ] 비밀번호 찾기 API (`POST /api/auth/forgot-password`)
- [ ] 비밀번호 재설정 API (`POST /api/auth/reset-password`)

**Frontend:**
- [ ] Zustand 스토어 설정 (authStore)
- [ ] Axios 인터셉터 설정 (토큰 자동 추가)
- [ ] 회원가입 페이지 (`/signup`)
  - React Hook Form + Zod 유효성 검사
  - 약관 동의 체크박스
- [ ] 로그인 페이지 (`/login`)
  - 이메일/비밀번호 입력
  - 자동 로그인 체크박스
  - 비밀번호 찾기 링크
- [ ] 비밀번호 찾기 페이지 (`/forgot-password`)
- [ ] Protected Route 설정
- [ ] 로그인 리다이렉션 처리

#### Day 6-7: 소셜 로그인
**Backend:**
- [ ] Kakao OAuth 전략 구현
  - 인증 URL 생성
  - 콜백 처리
  - 사용자 정보 저장/업데이트
- [ ] Naver OAuth 전략 구현
- [ ] 소셜 로그인 API (`GET /api/auth/:provider`, `GET /api/auth/:provider/callback`)

**Frontend:**
- [ ] 카카오 로그인 버튼 (노란색 + 네이버 아이콘)
- [ ] 네이버 로그인 버튼 (초록색 + 카카오 아이콘)
- [ ] 소셜 로그인 플로우 처리
- [ ] 동의 팝업 UI

---

### Week 3: 강의 시스템

#### Day 1-3: 강의 CRUD (Backend)
- [ ] Course 모델 정의
- [ ] Lesson 모델 정의
- [ ] 강의 목록 API (`GET /api/courses`)
  - 페이지네이션
  - 필터링 (카테고리, 가격)
  - 검색 (제목, 설명)
  - 정렬 (인기순, 최신순, 가격순)
- [ ] 강의 상세 API (`GET /api/courses/:id`)
- [ ] 강의 생성 API (`POST /api/courses`) - 관리자만
- [ ] 강의 수정 API (`PUT /api/courses/:id`) - 관리자만
- [ ] 강의 삭제 API (`DELETE /api/courses/:id`) - 관리자만
- [ ] 강의 좋아요 API (`POST /api/courses/:id/like`)

#### Day 4-5: 강의 페이지 (Frontend)
- [ ] 강의 목록 페이지 (`/courses`)
  - 카드 그리드 레이아웃
  - 필터 사이드바 (카테고리, 가격대)
  - 검색바
  - 페이지네이션
- [ ] 강의 상세 페이지 (`/courses/:id`)
  - 썸네일, 제목, 설명
  - 강사 정보
  - 커리큘럼 아코디언
  - 수강생 후기 및 평점
  - 가격 및 결제 버튼
  - 공유 버튼
- [ ] React Query로 데이터 페칭 및 캐싱
- [ ] 로딩 스켈레톤 UI

#### Day 6-7: 수강 신청 및 진도 관리
**Backend:**
- [ ] Enrollment 모델 정의
- [ ] 수강 신청 API (`POST /api/enrollments`)
  - 중복 수강 체크
  - 결제 연동 (다음 주)
- [ ] 내 수강 목록 API (`GET /api/enrollments`)
- [ ] 진도율 업데이트 API (`PUT /api/enrollments/:id/progress`)
- [ ] 강의 완료 API (`POST /api/enrollments/:id/complete`)

**Frontend:**
- [ ] 수강 신청 버튼 UI
- [ ] 수강 신청 모달 (결제 전)

---

### Week 4: 결제 시스템 + 학습 대시보드

#### Day 1-3: 결제 시스템
**Backend:**
- [ ] Payment 모델 정의
- [ ] TossPayments SDK 설정
- [ ] 결제 준비 API (`POST /api/payments/ready`)
  - orderId 생성
  - 결제 정보 임시 저장
- [ ] 결제 승인 API (`POST /api/payments/confirm`)
  - TossPayments 승인 요청
  - 결제 정보 DB 저장
  - 수강 신청 자동 처리
- [ ] 결제 내역 조회 API (`GET /api/payments`)
- [ ] 환불 API (`POST /api/payments/:id/refund`)
- [ ] 웹훅 엔드포인트 (`POST /api/payments/webhook`)

**Frontend:**
- [ ] 결제 페이지 (`/checkout/:courseId`)
  - 강의 정보 요약
  - 결제 금액
  - 결제 수단 선택 (카드, 계좌이체, 간편결제)
  - 쿠폰 입력 (선택사항)
  - 약관 동의
- [ ] TossPayments SDK 통합
- [ ] 결제 성공 페이지 (`/checkout/success`)
  - 결제 완료 메시지
  - 영수증 다운로드
  - 수강 시작 버튼
- [ ] 결제 실패 페이지 (`/checkout/fail`)

#### Day 4-5: 학습 대시보드
**Frontend:**
- [ ] 대시보드 레이아웃 (`/dashboard`)
- [ ] 내 강의 목록 (`/dashboard/courses`)
  - 수강 중인 강의 카드
  - 진도율 프로그레스 바
  - 이어보기 버튼
- [ ] 학습 통계 (`/dashboard/stats`)
  - 총 학습 시간
  - 완강률
  - 점수 추이 그래프 (Chart.js)
- [ ] 사이드바 네비게이션

#### Day 6-7: 비디오 플레이어
**Backend:**
- [ ] 비디오 스트리밍 엔드포인트 (`GET /api/lessons/:id/stream`)
- [ ] 진도율 자동 저장 (10초마다)

**Frontend:**
- [ ] 강의 수강 페이지 (`/learn/:courseId/:lessonId`)
- [ ] Video.js 플레이어 통합
  - 재생, 일시정지, 볼륨, 전체화면
  - 재생 속도 조절 (0.5x ~ 2x)
  - 자막 지원 (선택사항)
- [ ] 강의 자료 다운로드 버튼
- [ ] 다음/이전 강의 버튼
- [ ] 진도율 자동 저장
- [ ] 강의 목차 사이드바

---

## Phase 2: 핵심 기능 개발 (3주)

### Week 5: 마이페이지 + 후기 시스템

#### Day 1-3: 마이페이지
**Backend:**
- [ ] 프로필 조회 API (`GET /api/users/profile`)
- [ ] 프로필 수정 API (`PUT /api/users/profile`)
- [ ] 비밀번호 변경 API (`PUT /api/users/password`)
- [ ] 회원 탈퇴 API (`DELETE /api/users/account`)
- [ ] 아바타 업로드 API (`POST /api/users/avatar`)

**Frontend:**
- [ ] 프로필 페이지 (`/profile`)
  - 아바타 업로드
  - 이름, 전화번호 수정
  - 이메일 (수정 불가)
- [ ] 비밀번호 변경 페이지 (`/profile/password`)
- [ ] 수강 내역 페이지 (`/profile/enrollments`)
- [ ] 결제 내역 페이지 (`/profile/payments`)
  - 영수증 다운로드

#### Day 4-5: 후기 시스템
**Backend:**
- [ ] Review 모델 정의
- [ ] 후기 작성 API (`POST /api/reviews`)
  - 강의 수강 여부 확인
  - 이미지 업로드 (점수 인증샷)
- [ ] 후기 목록 API (`GET /api/reviews`)
  - 강의별 필터링
  - 점수대별 필터링
- [ ] 후기 수정/삭제 API
- [ ] 후기 좋아요 API (`POST /api/reviews/:id/like`)

**Frontend:**
- [ ] 후기 작성 모달
  - 별점 (1-5)
  - Before/After 점수
  - 리뷰 내용
  - 이미지 업로드
- [ ] 후기 목록 렌더링
- [ ] 후기 필터링 (점수대별 탭)

#### Day 6-7: 모바일 반응형 최적화
- [ ] 모든 페이지 모바일 레이아웃 점검
- [ ] 터치 제스처 지원
- [ ] 모바일 네비게이션 개선
- [ ] 반응형 이미지 (srcset)

---

### Week 6: 진단 테스트 + 관리자 기초

#### Day 1-3: 진단 테스트 시스템
**Backend:**
- [ ] Test 모델 정의 (문제, 선택지, 정답)
- [ ] TestResult 모델 정의
- [ ] 테스트 문제 조회 API (`GET /api/tests/:testId`)
- [ ] 테스트 제출 API (`POST /api/tests/:testId/submit`)
  - 자동 채점
  - 점수 계산
  - 결과 저장
- [ ] 테스트 결과 조회 API (`GET /api/test-results/:id`)

**Frontend:**
- [ ] 진단 테스트 페이지 (`/dashboard/test`)
  - 시작 화면
  - 문제 풀이 화면 (타이머)
  - 답안 제출
- [ ] 테스트 결과 페이지
  - 점수, 정답률
  - 틀린 문제 확인
  - 추천 강의

#### Day 4-7: 관리자 페이지 (기초)
**Backend:**
- [ ] 관리자 권한 체크 미들웨어
- [ ] 통계 API (`GET /api/admin/stats`)
  - 매출, 회원 수, 수강 통계

**Frontend:**
- [ ] 관리자 레이아웃 (`/admin`)
- [ ] 대시보드 (`/admin`)
  - 매출 그래프
  - 주요 지표 카드
- [ ] 강의 관리 (`/admin/courses`)
  - 강의 목록 테이블
  - 강의 생성 모달
  - 강의 수정/삭제
- [ ] 회원 관리 (`/admin/users`)
  - 회원 목록 테이블
  - 검색 기능
  - 회원 상태 변경 (활성화/비활성화)

---

### Week 7: 파일 업로드 + 알림 시스템

#### Day 1-3: 파일 업로드
**Backend:**
- [ ] AWS S3 또는 Cloudinary 설정
- [ ] Multer 미들웨어 설정
- [ ] 파일 업로드 API (`POST /api/uploads`)
  - 이미지 압축
  - 파일 크기 제한 (10MB)
  - 허용된 확장자만 (.jpg, .png, .mp4)
- [ ] 비디오 업로드 API (`POST /api/uploads/video`)
  - 청크 업로드 지원

**Frontend:**
- [ ] 드래그 앤 드롭 업로드 컴포넌트
- [ ] 업로드 진행률 표시
- [ ] 이미지 미리보기

#### Day 4-5: 이메일 알림 시스템
**Backend:**
- [ ] SendGrid 설정
- [ ] 이메일 템플릿 생성
  - 회원가입 환영 메일
  - 이메일 인증
  - 비밀번호 재설정
  - 결제 완료 영수증
- [ ] 이메일 발송 유틸리티 함수
- [ ] 백그라운드 작업 큐 (Bull + Redis, 선택사항)

#### Day 6-7: 관리자 - 결제 관리
**Frontend:**
- [ ] 결제 관리 페이지 (`/admin/payments`)
  - 결제 내역 테이블
  - 필터링 (날짜, 상태)
  - 엑셀 내보내기
  - 환불 처리 버튼

---

## Phase 3: 고급 기능 개발 (2주)

### Week 8: SEO + PWA + 성능 최적화

#### Day 1-2: SEO 최적화
- [ ] React Helmet 설정
- [ ] 페이지별 메타 태그 (title, description, keywords)
- [ ] Open Graph 태그 (Facebook, Twitter)
- [ ] 구조화된 데이터 (JSON-LD)
  - Course Schema
  - Review Schema
- [ ] Sitemap 생성
- [ ] robots.txt
- [ ] Canonical URL

#### Day 3-4: PWA 설정
- [ ] Vite PWA Plugin 설정
- [ ] Service Worker 등록
- [ ] Manifest.json 생성
  - 앱 이름, 아이콘, 테마 컬러
- [ ] Offline 페이지
- [ ] 캐싱 전략 (Cache First, Network First)
- [ ] 홈 화면 추가 안내 배너

#### Day 5-7: 성능 최적화
**Frontend:**
- [ ] 코드 스플리팅 (React.lazy)
- [ ] 번들 분석 (webpack-bundle-analyzer)
- [ ] Tree Shaking 확인
- [ ] Lazy Loading 이미지
- [ ] WebP 이미지 변환
- [ ] Lighthouse 점수 90+ 달성

**Backend:**
- [ ] MongoDB 인덱스 최적화
- [ ] Redis 캐싱 적용
  - 강의 목록
  - 인기 강의
- [ ] API 응답 압축 (gzip)
- [ ] Rate Limiting

---

### Week 9: 보안 강화 + 테스트

#### Day 1-2: 보안 강화
- [ ] Helmet.js 적용
- [ ] CSRF 토큰
- [ ] XSS 방어 (DOMPurify)
- [ ] Rate Limiting (express-rate-limit)
- [ ] SQL Injection 방어 확인
- [ ] 환경변수 암호화
- [ ] HTTPS 리다이렉트
- [ ] 보안 헤더 설정
  - Content-Security-Policy
  - X-Frame-Options
  - X-Content-Type-Options

#### Day 3-5: 테스트 작성
**Backend:**
- [ ] Jest 설정
- [ ] Unit Test (서비스 로직)
- [ ] Integration Test (API 엔드포인트)
- [ ] MongoDB Memory Server 설정

**Frontend:**
- [ ] Vitest 설정
- [ ] React Testing Library
- [ ] 컴포넌트 Unit Test
- [ ] E2E Test (Playwright)
  - 회원가입/로그인 플로우
  - 강의 구매 플로우

#### Day 6-7: 에러 추적 + 모니터링
- [ ] Sentry 설정
  - 프론트엔드 에러 추적
  - 백엔드 에러 추적
- [ ] Google Analytics 4 설정
- [ ] 사용자 이벤트 추적
  - 페이지뷰
  - 버튼 클릭
  - 결제 완료

---

## Phase 4: 배포 및 마무리 (1주)

### Week 10: Docker + CI/CD + 배포

#### Day 1-2: Docker 설정
- [ ] Frontend Dockerfile
- [ ] Backend Dockerfile
- [ ] Docker Compose (Frontend + Backend + MongoDB + Redis)
- [ ] 환경별 설정 (dev, staging, prod)
- [ ] Docker Compose로 로컬 환경 실행 테스트

#### Day 3-4: CI/CD 파이프라인
- [ ] GitHub Actions 워크플로우
  - Lint & Test
  - Build
  - Docker 이미지 빌드 & 푸시
  - 배포
- [ ] 환경별 배포 설정
  - Staging: 자동 배포
  - Production: 수동 승인

#### Day 5: 프로덕션 배포
**Frontend:**
- [ ] Vercel 또는 Netlify 배포
- [ ] 커스텀 도메인 연결
- [ ] HTTPS 설정

**Backend:**
- [ ] AWS EC2 또는 Railway 배포
- [ ] MongoDB Atlas 연결
- [ ] 환경변수 설정
- [ ] 로그 모니터링 설정

**Database:**
- [ ] MongoDB Atlas 클러스터 설정
- [ ] 인덱스 생성
- [ ] 백업 설정

#### Day 6-7: 최종 점검 및 문서화
- [ ] 전체 기능 QA 테스트
- [ ] 모바일 테스트 (실제 기기)
- [ ] 브라우저 호환성 테스트 (Chrome, Safari, Firefox)
- [ ] API 문서 작성 (Swagger)
- [ ] README.md 업데이트
- [ ] 배포 가이드 문서
- [ ] 사용자 가이드 (선택사항)
- [ ] 슬랙 알림 설정

---

## 🚀 즉시 시작 가능한 다음 작업

현재 완료된 것:
- ✅ 프로젝트 초기 설정 (React + TypeScript + Vite)
- ✅ Tailwind CSS 설정
- ✅ 브랜드 컬러 시스템
- ✅ 디렉토리 구조

**다음 작업 (Week 1, Day 1-2):**
1. 공통 컴포넌트 개발
   - Button (5가지 색상)
   - Card
   - Input/Textarea
   - Modal
   - Loading Spinner
   - Toast

계속 진행할까요?
