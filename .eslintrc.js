module.exports = {
  'parser': 'babel-eslint',
  'extends': 'airbnb',
  'plugins': ['flowtype'],
  'rules': {
    'class-methods-use-this': 0,
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'comma-dangle': ['error', {
        'arrays': 'only-multiline',
        'objects': 'only-multiline',
        'imports': 'only-multiline',
        'exports': 'only-multiline',
        'functions': 'ignore',
    }],
    'react/prefer-stateless-function': [1, { ignorePureComponents: true }],
    'react/forbid-prop-types': 0,
    'jsx-a11y/media-has-caption': 0,
    'no-continue': 0,
    'no-bitwise': 0,
    'max-len': ['warn', 120],
    'no-plusplus': 0,
    'arrow-body-style': 0,
    'no-param-reassign': ['error', { props: false }],
  },
  'env': {
    'browser': true,
  },
};
