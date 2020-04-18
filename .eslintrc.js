module.exports = {
  root: true,
  env: {
    node: true
  },
  'extends': [
    'plugin:vue/essential',
    '@vue/airbnb'
  ],
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    "object-shorthand": "off",
    "func-names": ["error", "never"],
    "no-underscore-dangle": "off",
    "comma-dangle": ["error", {"functions": "never"}],
    "max-len": [2, 120, 2, {"ignoreUrls": true}],
    "space-before-function-paren": "off",
    "prefer-destructuring": "off",
    "keyword-spacing": "off",
    "no-plusplus": ["error", { "allowForLoopAfterthoughts": true }]
  },
  parserOptions: {
    parser: 'babel-eslint'
  }
};