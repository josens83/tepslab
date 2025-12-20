# Supabase 복원 가이드

> Supabase 삭제일: 2025-12-20
> 이 문서는 서비스 재개 시 Supabase 복원 절차를 안내합니다.

## 1. 새 Supabase 프로젝트 생성

1. https://supabase.com 접속
2. "New Project" 클릭
3. 프로젝트 정보 입력:
   - Name: `tepslab` (또는 원하는 이름)
   - Database Password: 안전한 비밀번호 설정 (저장해둘 것)
   - Region: `Northeast Asia (Seoul)` 권장

## 2. 데이터베이스 스키마 생성

### 2.1 테이블 생성
1. Supabase Dashboard → SQL Editor 이동
2. `supabase/migrations/000_create_tables.sql` 내용 전체 복사
3. SQL Editor에 붙여넣기 후 실행 (Run)

### 2.2 RLS 정책 설정
1. `supabase/migrations/001_rls_policies.sql` 내용 복사
2. SQL Editor에서 실행

## 3. 환경 변수 설정

### 3.1 Supabase 키 확인
1. Dashboard → Settings → API
2. 아래 값 복사:
   - `Project URL` → VITE_SUPABASE_URL
   - `anon public` → VITE_SUPABASE_ANON_KEY

### 3.2 로컬 환경 (.env)
```bash
# client/.env
VITE_SUPABASE_URL=https://[프로젝트ID].supabase.co
VITE_SUPABASE_ANON_KEY=[anon-key]
```

### 3.3 Vercel 환경
1. Vercel Dashboard → Project → Settings → Environment Variables
2. 위 두 변수 추가

## 4. OAuth 설정 (소셜 로그인)

### 4.1 Supabase 설정
Dashboard → Authentication → Providers

### 4.2 Google OAuth
1. https://console.cloud.google.com
2. APIs & Services → Credentials
3. OAuth 2.0 Client ID 생성
4. Authorized redirect URI 추가:
   ```
   https://[프로젝트ID].supabase.co/auth/v1/callback
   ```
5. Client ID, Secret을 Supabase Provider 설정에 입력

### 4.3 Kakao OAuth
1. https://developers.kakao.com
2. 애플리케이션 생성
3. 플랫폼 → Web → 사이트 도메인 추가
4. 카카오 로그인 활성화
5. Redirect URI 추가:
   ```
   https://[프로젝트ID].supabase.co/auth/v1/callback
   ```
6. REST API 키, Client Secret을 Supabase에 입력

### 4.4 GitHub OAuth
1. https://github.com/settings/developers
2. New OAuth App
3. Callback URL:
   ```
   https://[프로젝트ID].supabase.co/auth/v1/callback
   ```
4. Client ID, Secret을 Supabase에 입력

## 5. Authentication 설정

Dashboard → Authentication → URL Configuration

```
Site URL: https://tepslab.vercel.app (프로덕션 URL)
Redirect URLs:
  - http://localhost:5173/auth/callback
  - https://tepslab.vercel.app/auth/callback
```

## 6. 확인 사항

- [ ] 테이블 생성 완료 (profiles, courses, enrollments 등)
- [ ] RLS 정책 적용 완료
- [ ] 환경 변수 설정 완료
- [ ] OAuth 설정 완료 (Google, Kakao, GitHub)
- [ ] 로컬 개발 서버에서 로그인 테스트
- [ ] Vercel 배포 후 프로덕션 테스트

## 7. 샘플 데이터 (선택)

서비스 테스트용 샘플 강좌 데이터:

```sql
-- 샘플 강좌 추가 (필요시 사용)
INSERT INTO courses (title, description, instructor_name, target_score, level, category, price, is_published, is_featured)
VALUES
  ('TEPS 327점 기초 문법', '문법 기초부터 차근차근', '김텝스', 327, 'beginner', 'grammar', 49000, true, true),
  ('TEPS 387점 어휘 완성', '핵심 어휘 3000개 마스터', '박보카', 387, 'intermediate', 'vocabulary', 59000, true, true),
  ('TEPS 450점 청해 집중', '고득점 청해 전략', '이리스닝', 450, 'advanced', 'listening', 69000, true, false);
```

## 8. 문제 해결

### 로그인이 안 될 때
1. Supabase URL/Key 확인
2. Site URL, Redirect URLs 확인
3. OAuth Provider 설정 확인

### 데이터가 안 보일 때
1. RLS 정책 확인 (`001_rls_policies.sql` 재실행)
2. 테이블의 `is_published` 값 확인

---

## 파일 위치 참고

```
tepslab/
├── supabase/
│   └── migrations/
│       ├── 000_create_tables.sql   ← 전체 스키마
│       └── 001_rls_policies.sql    ← RLS 정책
├── client/
│   ├── .env.example                ← 환경 변수 템플릿
│   └── src/
│       ├── lib/supabase.ts         ← 클라이언트 설정
│       └── types/supabase.ts       ← 타입 정의
└── docs/
    └── SUPABASE_RESTORE.md         ← 이 문서
```
