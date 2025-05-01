module.exports = {
  root: true,
  env: { browser: true, node: true, es2021: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:jsx-a11y/recommended',
    'prettier', // turn off ESLint rules that conflict with Prettier
    'plugin:prettier/recommended',
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'react', 'prettier'],
  settings: { react: { version: 'detect' } },
  rules: {
    'prettier/prettier': 'error',
    // your overrides…
  },
};
