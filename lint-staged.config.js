/**
 * @type {import('lint-staged').Configuration}
 */
export default {
  '*': ['prettier --write --ignore-unknown'],

  // ======================
  // Python
  // ======================
  '**/*.py': [
    'ruff check --fix',
    'ruff format',
    // 用 uv 保证和你 scripts / CI 的 pyright 一致
    'uv run pyright',
  ],
};
