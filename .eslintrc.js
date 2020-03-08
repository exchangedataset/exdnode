module.exports = {
  env: {
    node: true,
  },
  extends: [
    'plugin:@typescript-eslint/recommended'
  ],
  globals: {
    BigInt:true,
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2019,
    sourceType: 'module',
  },
  plugins: [
    '@typescript-eslint',
  ],
  rules: {
  },
};
