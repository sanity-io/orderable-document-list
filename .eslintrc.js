module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  env: {
    node: true,
    browser: true,
  },
  settings: {
    react: {version: '16.9.0'},
  },
  extends: [
    'sanity',
    'sanity/react',
    'sanity/import',
    'plugin:react-hooks/recommended',
    'prettier',
  ],
  rules: {
    'no-use-before-define': 'off',
    '@typescript-eslint/no-var-requires': 'off',
    'import/no-extraneous-dependencies': 'off',
    'import/no-unresolved': 'off',
    'import/named': 'off',
    'sort-imports': 'off', // prefer import/order
    'react/jsx-no-bind': [
      1,
      {
        ignoreDOMComponents: true,
      },
    ],
    'react/forbid-prop-types': [0],
  },
  plugins: ['prettier', 'react'],
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      rules: {
        'no-undef': 'off',
      },
    },
  ],
}
