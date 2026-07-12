import coreWebVitals from 'eslint-config-next/core-web-vitals'
import nextTypescript from 'eslint-config-next/typescript'
import prettierConfig from 'eslint-config-prettier'

// Flat-config migration of the former .eslintrc.json. eslint-config-next 16
// ships native flat configs (core-web-vitals bundles the react, react-hooks,
// jsx-a11y and import rule sets; typescript adds @typescript-eslint recommended
// via typescript-eslint). The project's own complexity/TS rules and per-area
// overrides are layered on top; prettier is applied last to disable stylistic
// rules that Prettier owns.
const eslintConfig = [
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      'coverage/**',
      'lib/generated/**',
      'scripts/**',
      'playwright-report/**',
      'test-results/**',
    ],
  },
  ...coreWebVitals,
  ...nextTypescript,
  {
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.json', './__tests__/tsconfig.json'],
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    settings: {
      react: {
        // Pinned (not 'detect') so eslint-plugin-react 7.37.5 skips the version
        // auto-detection path that calls the eslint-10-removed context.getFilename().
        version: '19.2.7',
      },
    },
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],

      // React-Compiler advisory rules newly enabled by eslint-plugin-react-hooks
      // 7 (via next 16). They flag existing, working patterns (e.g. setState in
      // an effect) that the pre-upgrade lint never gated; surfaced as warnings
      // for incremental cleanup rather than blocking the build on a dep bump.
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/refs': 'warn',
      'react-hooks/immutability': 'warn',
      'react-hooks/purity': 'warn',

      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'jsx-a11y/anchor-is-valid': 'off',

      // Complexity Detection Rules
      complexity: ['error', { max: 10 }],
      'max-lines': ['error', { max: 300, skipBlankLines: true, skipComments: true }],
      'max-lines-per-function': ['error', { max: 50, skipBlankLines: true, skipComments: true }],
      'max-depth': ['error', { max: 4 }],
      'max-params': ['error', { max: 5 }],
      'max-nested-callbacks': ['error', { max: 3 }],

      // TypeScript-specific complexity rules
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/prefer-nullish-coalescing': 'warn',
      '@typescript-eslint/prefer-optional-chain': 'warn',
      '@typescript-eslint/no-non-null-assertion': 'error',
      '@typescript-eslint/explicit-function-return-type': [
        'warn',
        { allowExpressions: true, allowTypedFunctionExpressions: true },
      ],
    },
  },
  {
    files: [
      '**/__tests__/**/*.{ts,tsx,js,jsx}',
      '**/*.test.{ts,tsx,js,jsx}',
      '**/*.spec.{ts,tsx,js,jsx}',
    ],
    rules: {
      'max-lines-per-function': ['error', { max: 150 }],
      'max-lines': ['error', { max: 600 }],
      'max-nested-callbacks': ['error', { max: 6 }],
      complexity: ['error', { max: 15 }],
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },
  {
    files: [
      'app/admin/**/*.{ts,tsx}',
      'app/api/admin/**/*.{ts,tsx}',
      'lib/auth/**/*.{ts,tsx}',
      'middleware.ts',
    ],
    rules: {
      'max-lines-per-function': ['error', { max: 600 }],
      'max-lines': ['error', { max: 700 }],
      complexity: ['error', { max: 25 }],
      '@typescript-eslint/no-non-null-assertion': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-function-return-type': 'off',
      'jsx-a11y/label-has-associated-control': 'off',
      'jsx-a11y/heading-has-content': 'off',
      'react/no-unescaped-entities': 'off',
    },
  },
  {
    files: ['components/ui/**/*.{ts,tsx}'],
    rules: {
      'jsx-a11y/heading-has-content': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
    },
  },
  prettierConfig,
]

export default eslintConfig
