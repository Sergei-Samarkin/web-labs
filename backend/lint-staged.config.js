module.exports = {
  '**/*.ts': [
    'eslint --fix',
    'prettier --write'
  ],
  '**/*.{json,md,yml,yaml}': [
    'prettier --write'
  ]
};
