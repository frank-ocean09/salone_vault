import { defineConfig } from 'eslint/config';

export default defineConfig({
  overrides: [
    {
      files: ['**/*.{ts,tsx}'],
      extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:react-hooks/recommended',
        'prettier',
      ],
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
      },
      rules: {},
    },
  ],
});
