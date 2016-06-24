module.exports = {
  "parser": "babel-eslint",
  "extends": ["google"],
  "rules": {
    "max-len": [0, 120, 2],
    "camelcase": [2, {
      "properties": "never"
    }],
    "require-jsdoc": 0,
    "no-debugger": 1
  },
  "env": {
    "browser": true
  },
  "globals": {
    "IS_DEV": true,
    "IS_PROD": true
  }
};
