module.exports = {
  'env': {
    'es6': true,
    'node': true
  },
  'extends': 'eslint:recommended',
  'parserOptions': {
    'sourceType': 'module'
  },
  'rules': {
    'brace-style': ['error', '1tbs', { allowSingleLine: true }],
    'eol-last': 'error',
    'indent': ['warn', 2],
    'linebreak-style': ['error', 'unix'],
    'no-const-assign': 'error',
    'no-multiple-empty-lines': 'error',
    'no-unused-vars': 'error',
    'no-tabs': 'error',
    'no-trailing-spaces': 'error',
    'quotes': ['warn', 'single'],
    'semi': ['error', 'always']
  }
};
