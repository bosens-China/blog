/**
 * @type {import('lint-staged').Configuration}
 */
export default {
  '*': ['prettier --write --ignore-unknown'],

  // ======================
  // Python
  // ======================
  '**/*.py': [
    'pnpm exec pyright',
    'pnpm exec ruff check --fix',
    'pnpm exec ruff format',
  ],
};
