// @ts-check

import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import jsdoc from 'eslint-plugin-jsdoc';
import pluginJest from 'eslint-plugin-jest';

export default tseslint.config(
  eslint.configs.recommended,
  tseslint.configs.recommended,
  pluginJest.configs["flat/recommended"],
  jsdoc.configs['flat/recommended'],
  {
    ignores: ['**/*.tst.ts']
  }
)
