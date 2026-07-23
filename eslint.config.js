// @ts-check
const eslint = require('@eslint/js');
const { defineConfig } = require('eslint/config');
const tseslint = require('typescript-eslint');
const angular = require('angular-eslint');
const eslintPluginBetterTailwindcss = require('eslint-plugin-better-tailwindcss');

module.exports = defineConfig([
  {
    files: ['**/*.ts'],
    extends: [
      eslint.configs.recommended,
      tseslint.configs.recommended,
      tseslint.configs.stylistic,
      angular.configs.tsRecommended,
      eslintPluginBetterTailwindcss.configs.recommended,
    ],
    processor: angular.processInlineTemplates,
    settings: {
      'better-tailwindcss': {
        entryPoint: 'src/styles.css',
      },
    },
    rules: {
      '@angular-eslint/directive-selector': [
        'off',
        {
          type: 'attribute',
          prefix: 'app',
          style: 'camelCase',
        },
      ],
      '@angular-eslint/component-selector': [
        'off',
        {
          type: 'element',
          prefix: 'app',
          style: 'kebab-case',
        },
      ],
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
  {
    files: ['**/*.html'],
    extends: [angular.configs.templateRecommended, angular.configs.templateAccessibility],
    rules: {
      '@angular-eslint/template/elements-content': [
        'error',
        {
          allowList: ['iconBtn'],
        },
      ],
    },
  },
]);
