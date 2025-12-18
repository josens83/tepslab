module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',     // 새 기능
        'fix',      // 버그 수정
        'docs',     // 문서 수정
        'style',    // 코드 포맷팅
        'refactor', // 리팩토링
        'test',     // 테스트
        'chore',    // 빌드, 설정 등
        'perf',     // 성능 개선
        'ci',       // CI 설정
        'revert',   // 되돌리기
      ],
    ],
    'subject-max-length': [2, 'always', 100],
    'body-max-line-length': [0, 'always', Infinity],
  },
}
