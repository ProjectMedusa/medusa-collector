module.exports = {
  env: {
    commonjs: true,
    es2020: true,
    node: true,
  },
  extends: [
    'airbnb-base',
  ],
  parserOptions: {
    ecmaVersion: 12,
  },
  rules: {
    'import/no-dynamic-require': ['off'],
    'no-await-in-loop': ['off'],
    'no-restricted-syntax': ['off'],
  },
};
