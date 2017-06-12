module.exports = {
  parser: 'babel-eslint',
  extends: ['airbnb-base'],
  rules: {
    'max-len': [0, 100, 2],
    'no-underscore-dangle': 0,
    'no-prototype-builtins': 0,
    camelcase: [
      2,
      {
        properties: 'never',
      },
    ],
  },
  env: {
    browser: true,
  },
  globals: {
    __VERSION__: true,
  },
};
