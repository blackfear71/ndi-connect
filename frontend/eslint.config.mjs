// eslint.config.mjs
import js from '@eslint/js';
import prettier from 'eslint-plugin-prettier';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import globals from 'globals';

/** @type {import("eslint").Linter.FlatConfig[]} */
export default [
    {
        ignores: ['build/**'],
    },
    js.configs.recommended,
    {
        files: ['src/**/*.jsx', '**/*.test.jsx', '**/*.test.js'],
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
            globals: {
                ...globals.browser,
                ...globals.node,
                test: 'readonly',
                expect: 'readonly',
                describe: 'readonly',
                beforeEach: 'readonly',
                afterEach: 'readonly',
                it: 'readonly',
            },
            parserOptions: {
                ecmaFeatures: {
                    jsx: true,
                },
            },
        },
        plugins: {
            react,
            'react-hooks': reactHooks,
            'simple-import-sort': simpleImportSort,
            prettier,
        },
        settings: {
            react: {
                version: 'detect',
            },
        },
        rules: {
            // Règles React
            'react/display-name': 'off',
            'react/jsx-uses-vars': 'warn',
            'react/jsx-uses-react': 'off',
            'react/react-in-jsx-scope': 'off',
            'react/prop-types': 'off',
            'react/no-unescaped-entities': 'off',
            'react-hooks/exhaustive-deps': 'off',

            // Règles générales
            'no-unused-vars': 'warn',
            'no-console': 'warn',
            'no-shadow': 'error',
            eqeqeq: ['error', 'always'],

            // Règles personnalisées
            quotes: ['error', 'single'],
            semi: 'error',
            indent: [
                'error',
                4,
                {
                    SwitchCase: 1,
                },
            ],
            'simple-import-sort/imports': [
                'error',
                {
                    groups: [
                        ['^react$'],
                        ['^@?\\w'],
                        ['api'],
                        ['assets'],
                        ['components'],
                        ['pages'],
                        ['enum'],
                        ['rxjs'],
                        ['^\\.\\.(?!/?$)', '^\\.\\./?$'],
                        ['^\\./(?=.*/)(?!/?$)', '^\\.(?!/?$)', '^\\./?$'],
                    ],
                },
            ],
            'prettier/prettier': [
                'error',
                {
                    singleQuote: true,
                    tabWidth: 4,
                    endOfLine: 'lf',
                },
            ],
        },
    },
];
