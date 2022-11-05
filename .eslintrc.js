module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint/eslint-plugin'],
  extends: [
    'plugin:@typescript-eslint/recommended',
    //'plugin:prettier/recommended',
  ],
  settings: {
    //experimentalDecorators: true
  },
  root: true,
  env: {
    node: true,
    jest: true,
  },
  ignorePatterns: ['.eslintrc.js'],
  rules: {
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    indent: ['error', 4,],
    semi: ['error', 'always'],
    quotes: ['error', 'single'],
    'comma-spacing': ["error", { "before": false, "after": true }],
    'block-spacing': "error",
    'semi-spacing': "error",
    'arrow-spacing': ["error", { "before": true, "after": true }],
    'object-curly-spacing': ["error", "always"],
  }
}