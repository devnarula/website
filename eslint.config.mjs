import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import pluginReact from 'eslint-plugin-react';
import { defineConfig } from 'eslint/config';

export default defineConfig([
  // Base JavaScript and TypeScript recommended rules
  {
    files: ['**/*.{js,mjs,cjs,ts,jsx,tsx}'],
    plugins: { js },
    extends: ['js/recommended'],
  },
  // Browser globals
  {
    files: ['**/*.{js,mjs,cjs,ts,jsx,tsx}'],
    languageOptions: { globals: globals.browser },
  },
  // TypeScript ESLint recommended settings
  tseslint.configs.recommended,
  // React recommended (flat config)
  pluginReact.configs.flat.recommended,
  // Disable React-in-JSX-scope and No Unescaped Entities for JSX/TSX files
  {
    files: ['**/*.{jsx,tsx}'],
    rules: {
      'react/react-in-jsx-scope': 'off',
      'react/no-unescaped-entities': 'off',
    },
    settings: {
      react: {
        version: 'detect',
        runtime: 'automatic',
      },
    },
  },
  // Turn off no-explicit-any rule for TS/TSX files
  {
    files: ['**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
]);
