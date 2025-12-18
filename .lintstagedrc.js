module.exports = {
  // TypeScript/React 파일: 전체 타입 체크 + ESLint
  'client/src/**/*.{ts,tsx}': [
    // TypeScript 전체 프로젝트 타입 체크 (파일 인자 무시)
    () => 'cd client && npm run typecheck',
    // 스테이징된 파일만 lint
    'eslint --fix --max-warnings=0',
  ],
  // CSS/JSON/MD 파일: Prettier
  'client/src/**/*.{css,json,md}': [
    'prettier --write',
  ],
}
