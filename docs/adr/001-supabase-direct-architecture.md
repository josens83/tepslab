# ADR 001: Supabase Direct 아키텍처 채택

## 상태
승인됨 (2024-12)

## 컨텍스트
TepsLab 프로젝트의 백엔드 아키텍처를 결정해야 했습니다. 초기에는 Express.js 백엔드 서버를 고려했으나, 솔로 개발자로서의 운영 부담과 비용을 고려해야 했습니다.

### 고려한 옵션들
1. **Express.js + MongoDB**: 전통적인 백엔드 서버
2. **Next.js API Routes**: 프론트엔드와 백엔드 통합
3. **Supabase Direct**: 프론트엔드에서 Supabase 직접 연결

## 결정
**Supabase Direct 아키텍처를 채택**합니다.

프론트엔드(React)에서 Supabase를 직접 호출하고, 복잡한 비즈니스 로직은 Supabase Edge Functions로 처리합니다.

## 이유

### 장점
1. **운영 간소화**: 별도 서버 관리 불필요
2. **비용 절감**: Vercel + Supabase 무료 티어로 시작 가능
3. **개발 속도**: 백엔드 코드 작성 최소화
4. **스케일링**: Supabase의 자동 스케일링 활용
5. **보안**: Row Level Security(RLS)로 데이터 접근 제어

### 단점
1. **복잡한 비즈니스 로직 제한**: Edge Functions 필요
2. **Vendor Lock-in**: Supabase에 종속
3. **학습 곡선**: RLS 정책 설계 필요

## 결과

### 아키텍처 다이어그램
```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Browser    │────▶│   Vercel     │────▶│  Supabase    │
│   (React)    │     │   (Static)   │     │  (Database)  │
└──────────────┘     └──────────────┘     └──────────────┘
                                                 │
                                                 ▼
                                          ┌──────────────┐
                                          │ Edge Funcs   │
                                          │ (Payment)    │
                                          └──────────────┘
```

### 영향받는 영역
- 인증: Supabase Auth 사용
- 데이터베이스: Supabase PostgreSQL
- 파일 저장: Supabase Storage
- 결제 처리: Supabase Edge Functions + Toss Payments

## 참고
- [Supabase 문서](https://supabase.com/docs)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
