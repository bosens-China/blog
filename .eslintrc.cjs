// const path = require('path');

module.exports = {
  extends: ['next/core-web-vitals', 'next/typescript'],
  settings: {
    react: {
      version: '18',
    },
    // next: {
    //   rootDir: 'packages/*/',
    // },
  },
  rules: {
    '@next/next/no-html-link-for-pages': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    'no-console': ['error', { allow: ['warn', 'error', 'info'] }],
    'no-debugger': 'error',
  },
};
