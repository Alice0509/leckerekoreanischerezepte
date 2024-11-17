module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:prettier/recommended', // Prettier와 ESLint를 통합
    'next/core-web-vitals', // Next.js 기본 ESLint 설정
  ],
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: ['react', 'prettier'],
  rules: {
    'prettier/prettier': 'error', // Prettier 규칙 위반 시 오류로 표시
    'react/react-in-jsx-scope': 'off', // Next.js에서는 필요 없음
  },
};
