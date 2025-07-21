// @ts-check

import tseslint from 'typescript-eslint';
import eslint from '@eslint/js';
import importPlugin from 'eslint-plugin-import';
import vitest from '@vitest/eslint-plugin';
import prettierConfig from 'eslint-config-prettier';

export default tseslint.config(
  { ignores: ['eslint.config.js', 'vitest.config.ts', '**/generated/**'] },
  eslint.configs.recommended,
  tseslint.configs.strictTypeChecked,
  importPlugin.flatConfigs.recommended,
  importPlugin.flatConfigs.typescript,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    settings: {
      'import/resolver': {
        typescript: {
          project: 'tsconfig.json',
        },
      },
    },
  },
  {
    files: ['tests/**/*.test.ts'],
    plugins: { vitest },
    rules: {
      ...vitest.configs.recommended.rules,
    },
  },
  {
    rules: {
      eqeqeq: 'error',
      '@typescript-eslint/restrict-template-expressions': 'warn',
      'import/order': [
        'error',
        {
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index', 'object'],
          alphabetize: {
            order: 'asc',
          },
          'newlines-between': 'never',
        },
      ],
    },
  },
  prettierConfig,
);
