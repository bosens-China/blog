module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es6: true,
    node: true,
  },
  extends: [
    'airbnb-base',
  ],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
  },
  parserOptions: {
    ecmaVersion: 2018,
  },
  rules: {
    'import/prefer-default-export': 0,
    'prefer-promise-reject-errors': 0,
    'no-console': 0,
    'no-restricted-syntax': 0,
  },
};
