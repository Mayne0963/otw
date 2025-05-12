import { defineConfig } from 'eslint-define-config';

export default defineConfig({
  languageOptions: {
    parser: '@typescript-eslint/parser',
    parserOptions: {
      project: './tsconfig.json'
    }
  },
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'next/core-web-vitals'
  ],
  rules: {
    // Add custom rules here
  },
  env: {
    browser: true,
    node: true
  }
});
