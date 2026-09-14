import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
    },
  },
  {
    // Legacy pages intentionally synchronize editable inputs to preview state.
    // New lab code uses explicit reducer transitions and retains the stricter rule.
    files: ['src/modules/**/*.jsx'],
    rules: { 'react-hooks/set-state-in-effect': 'off' },
  },
  {
    files: ['src/context/ModeContext.jsx'],
    rules: { 'react-refresh/only-export-components': ['error', { allowExportNames: ['useMode'] }] },
  },
  {
    files: ['tests/**/*.js'],
    languageOptions: { globals: globals.node },
  },
])
