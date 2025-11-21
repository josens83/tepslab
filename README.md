# 🎓 TEPS Lab - 프리미엄 TEPS 학습 플랫폼

점수대별 맞춤 커리큘럼을 제공하는 상용화 수준의 온라인 TEPS 학습 플랫폼

[![CI](https://github.com/josens83/tepslab/actions/workflows/ci.yml/badge.svg)](https://github.com/josens83/tepslab/actions/workflows/ci.yml)
[![Docker Build](https://github.com/josens83/tepslab/actions/workflows/docker-build.yml/badge.svg)](https://github.com/josens83/tepslab/actions/workflows/docker-build.yml)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)

## 📋 목차

- [프로젝트 개요](#-프로젝트-개요)
- [주요 기능](#-주요-기능)
- [기술 스택](#-기술-스택)
- [시작하기](#-시작하기)
- [프로젝트 구조](#-프로젝트-구조)
- [API 문서](#-api-문서)
- [배포](#-배포)
- [개발 일정](#-개발-일정)
- [라이선스](#-라이선스)

## 🎯 프로젝트 개요

TEPS Lab은 consulteps.com을 벤치마킹하여 개발한 **프리미엄 TEPS 온라인 학습 플랫폼**입니다.

### 핵심 목표
- 웹, 모바일, 앱에서 즉시 상용화 가능한 수준의 플랫폼 구축
- 점수대별 맞춤 커리큘럼 제공 (327점, 387점, 450점, 550점, 노베이스)
- 현대적인 UI/UX와 안정적인 백엔드 시스템
- 확장 가능한 아키텍처와 보안 강화

## ✨ 주요 기능

### 사용자 기능
- ✅ **회원 인증**
  - 이메일/비밀번호 로그인
  - 카카오/네이버 소셜 로그인
  - JWT 토큰 기반 인증

- ✅ **강의 시스템**
  - 점수대별 강의 목록 (327, 387, 450, 550점)
  - 영역별 강의 (문법, 어휘, 청취, 독해, 종합)
  - 비디오 플레이어 및 진도 추적
  - 강의 자료 다운로드

- ✅ **결제 시스템**
  - TossPayments 통합
  - 다양한 결제 수단 지원
  - 결제 내역 조회
  - 환불 처리

- ✅ **학습 관리**
  - 내 강의 대시보드
  - 진도율 자동 계산
  - 학습 통계
  - 진단 테스트

- ✅ **후기 시스템**
  - 강의 평점 및 후기 작성
  - Before/After 점수 공유
  - 후기 좋아요 기능

### 관리자 기능
- ✅ **대시보드**
  - 매출/회원/수강 통계
  - 월별 매출 추이
  - 인기 강의 분석

- ✅ **회원 관리**
  - 회원 목록 조회/검색
  - 회원 상태 변경

- ✅ **강의 관리**
  - 강의 CRUD
  - 레슨 관리

- ✅ **결제 관리**
  - 결제 내역 조회
  - 환불 처리

- ✅ **파일 관리**
  - 이미지/비디오 업로드
  - 파일 삭제

## 🛠 기술 스택

### Frontend
| 기술 | 버전 | 용도 |
|------|------|------|
| React | 19.2 | UI 라이브러리 |
| TypeScript | 5.9 | 타입 안전성 |
| Vite | 7.2 | 빌드 도구 |
| Tailwind CSS | 3.4 | 스타일링 |
| Zustand | 5.0 | 상태 관리 |
| React Router | 7.9 | 라우팅 |
| Framer Motion | 12.23 | 애니메이션 |
| Axios | 1.13 | HTTP 클라이언트 |
| React Helmet Async | 2.0 | SEO 메타 태그 |

### Backend
| 기술 | 버전 | 용도 |
|------|------|------|
| Node.js | 20+ | 런타임 |
| Express.js | 4.18 | 웹 프레임워크 |
| TypeScript | 5.3 | 타입 안전성 |
| MongoDB | 7+ | 데이터베이스 |
| Mongoose | 8.0 | ODM |
| JWT | 9.0 | 인증 |
| Bcrypt | 2.4 | 암호화 |
| Helmet | 7.1 | 보안 헤더 |
| Rate Limit | 7.1 | 요청 제한 |

### DevOps
| 기술 | 용도 |
|------|------|
| Docker | 컨테이너화 |
| Docker Compose | 오케스트레이션 |
| GitHub Actions | CI/CD |
| Nginx | 리버스 프록시 |

### 테스트
| 기술 | 용도 |
|------|------|
| Jest | 백엔드 단위 테스트 |
| Supertest | API 통합 테스트 |
| MongoDB Memory Server | 인메모리 DB 테스트 |

## 🚀 시작하기

### 필수 요구사항
- Node.js 20+
- npm
- MongoDB 7+
- Docker & Docker Compose (선택사항)

### 로컬 개발 환경 설정

#### 1. 저장소 클론
```bash
git clone https://github.com/josens83/tepslab.git
cd tepslab
```

#### 2. 환경 변수 설정
```bash
# 서버 환경 변수
cp server/.env.example server/.env

# 클라이언트 환경 변수
echo "VITE_API_URL=http://localhost:5000" > client/.env
```

#### 3. 서버 설정 및 실행
```bash
cd server
npm install
npm run dev
```

서버는 http://localhost:5000 에서 실행됩니다.

#### 4. 클라이언트 설정 및 실행
```bash
cd client
npm install --legacy-peer-deps
npm run dev
```

클라이언트는 http://localhost:5173 에서 실행됩니다.

### Docker로 실행

#### 1. 환경 변수 설정
```bash
cp .env.docker.example .env
# .env 파일을 편집하여 필요한 값 입력
```

#### 2. Docker Compose 실행
```bash
docker-compose up -d
```

#### 3. 서비스 확인
- Frontend: http://localhost
- Backend API: http://localhost:5000
- MongoDB: mongodb://localhost:27017

#### 4. 로그 확인
```bash
docker-compose logs -f
```

#### 5. 서비스 중지
```bash
docker-compose down
```

## 📁 프로젝트 구조

```
tepslab/
├── client/                    # Frontend (React + Vite)
│   ├── src/
│   │   ├── components/        # 재사용 가능한 컴포넌트
│   │   │   ├── common/        # 공통 컴포넌트 (Button, Card, etc.)
│   │   │   ├── layout/        # 레이아웃 (Header, Footer)
│   │   │   ├── landing/       # 랜딩 페이지 섹션
│   │   │   ├── course/        # 강의 관련 컴포넌트
│   │   │   └── review/        # 후기 관련 컴포넌트
│   │   ├── pages/             # 페이지 컴포넌트
│   │   ├── store/             # Zustand 상태 관리
│   │   ├── hooks/             # 커스텀 hooks
│   │   ├── lib/               # API 클라이언트
│   │   ├── types/             # TypeScript 타입
│   │   └── utils/             # 유틸리티 함수
│   ├── public/                # 정적 파일
│   ├── Dockerfile             # 프론트엔드 Docker 이미지
│   └── nginx.conf             # Nginx 설정
│
├── server/                    # Backend (Node.js + Express)
│   ├── src/
│   │   ├── config/            # 설정 파일
│   │   ├── controllers/       # 라우트 컨트롤러
│   │   ├── middleware/        # 미들웨어 (auth, error handling)
│   │   ├── models/            # Mongoose 모델
│   │   ├── routes/            # API 라우트
│   │   ├── services/          # 비즈니스 로직 서비스
│   │   ├── utils/             # 유틸리티 함수
│   │   ├── types/             # TypeScript 타입
│   │   └── __tests__/         # 테스트 파일
│   ├── dist/                  # 컴파일된 JavaScript
│   ├── uploads/               # 업로드된 파일
│   ├── Dockerfile             # 백엔드 Docker 이미지
│   └── jest.config.js         # Jest 설정
│
├── .github/
│   └── workflows/             # GitHub Actions CI/CD
│       ├── ci.yml             # 테스트 및 빌드
│       └── docker-build.yml   # Docker 이미지 빌드
│
├── docker-compose.yml         # Docker Compose 설정
├── .env.docker.example        # Docker 환경 변수 예시
├── ARCHITECTURE.md            # 아키텍처 문서
├── DEVELOPMENT_PLAN.md        # 개발 계획
├── TECHNICAL_SPECS.md         # 기술 명세
└── README.md                  # 프로젝트 README
```

## 📚 API 문서

### 인증 (Authentication)
```
POST   /api/auth/register      # 회원가입
POST   /api/auth/login         # 로그인
GET    /api/auth/me            # 현재 사용자 정보
GET    /api/auth/kakao         # 카카오 로그인
GET    /api/auth/naver         # 네이버 로그인
```

### 강의 (Courses)
```
GET    /api/courses            # 강의 목록 (필터, 검색, 페이지네이션)
GET    /api/courses/:id        # 강의 상세
POST   /api/courses            # 강의 생성 (관리자)
PUT    /api/courses/:id        # 강의 수정 (관리자)
DELETE /api/courses/:id        # 강의 삭제 (관리자)
```

### 수강 (Enrollments)
```
POST   /api/enrollments        # 수강 신청
GET    /api/enrollments        # 내 수강 목록
PUT    /api/enrollments/:id/progress  # 진도 업데이트
```

### 결제 (Payments)
```
POST   /api/payments/ready     # 결제 준비
POST   /api/payments/confirm   # 결제 승인
GET    /api/payments           # 결제 내역
POST   /api/payments/:id/cancel # 결제 취소/환불
```

### 후기 (Reviews)
```
GET    /api/reviews/course/:courseId  # 강의별 후기
POST   /api/reviews                   # 후기 작성
PUT    /api/reviews/:id               # 후기 수정
DELETE /api/reviews/:id               # 후기 삭제
```

### 테스트 (Tests)
```
GET    /api/tests              # 테스트 목록
GET    /api/tests/:id          # 테스트 상세
POST   /api/tests/:id/submit   # 테스트 제출
GET    /api/tests/results/my   # 내 테스트 결과
```

### 관리자 (Admin)
```
GET    /api/admin/stats        # 통계
GET    /api/admin/users        # 회원 관리
PUT    /api/admin/users/:id/status  # 회원 상태 변경
GET    /api/admin/payments     # 결제 관리
POST   /api/admin/payments/:id/refund  # 환불 처리
```

### 파일 업로드 (Uploads)
```
POST   /api/uploads/image      # 이미지 업로드
POST   /api/uploads/images     # 다중 이미지 업로드
POST   /api/uploads/video      # 비디오 업로드 (관리자)
DELETE /api/uploads/:filename  # 파일 삭제
```

## 🌐 배포

### 프로덕션 체크리스트
- [ ] 환경 변수 설정 완료
- [ ] MongoDB Atlas 설정
- [ ] TossPayments 본계정 설정
- [ ] OAuth 앱 본계정 설정
- [ ] SMTP 이메일 설정
- [ ] 도메인 및 SSL 인증서
- [ ] CORS 설정 확인
- [ ] Rate Limiting 설정 조정
- [ ] 로그 모니터링 설정
- [ ] 백업 전략 수립

### 배포 플랫폼
- **Frontend**: Vercel / Netlify
- **Backend**: AWS EC2 / Railway / Render
- **Database**: MongoDB Atlas
- **CDN**: Cloudflare

## 📅 개발 일정

### Phase 1: MVP 개발 (Week 1-4) ✅ 완료
- Week 1-2: 프로젝트 기초 구축, 인증 시스템
- Week 3-4: 강의 시스템, 결제 시스템

### Phase 2: 핵심 기능 개발 (Week 5-7) ✅ 완료
- Week 5: 마이페이지, 후기 시스템
- Week 6: 진단 테스트, 관리자 시스템
- Week 7: 파일 업로드, 이메일 알림

### Phase 3: 고급 기능 개발 (Week 8-9) ✅ 완료
- Week 8: SEO 최적화, PWA 설정, 성능 최적화
- Week 9: 보안 강화, 테스트 인프라

### Phase 4: 배포 및 마무리 (Week 10) ✅ 완료
- Week 10: Docker, CI/CD, 문서화

## 🔐 보안 기능

- ✅ Helmet.js로 보안 HTTP 헤더 설정
- ✅ Rate Limiting (API 100req/15min, Auth 10req/15min)
- ✅ NoSQL Injection 방어
- ✅ XSS 공격 방어
- ✅ HTTP Parameter Pollution 방어
- ✅ CORS 설정
- ✅ JWT 토큰 기반 인증
- ✅ Bcrypt 비밀번호 해싱
- ✅ Content Security Policy

## 🧪 테스트

### 백엔드 테스트 실행
```bash
cd server
npm test                  # 테스트 실행
npm run test:watch        # Watch 모드
npm run test:coverage     # 커버리지 리포트
```

### 테스트 커버리지 목표
- Unit Tests: 80%+
- Integration Tests: 주요 API 엔드포인트

## 📝 라이선스

ISC License

## 👥 기여자

- **Developer**: TEPS Lab Team

## 📞 문의

- Email: support@tepslab.com
- GitHub Issues: https://github.com/josens83/tepslab/issues

---

**Made with ❤️ by TEPS Lab**
