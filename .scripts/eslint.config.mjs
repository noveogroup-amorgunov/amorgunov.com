import antfu from '@antfu/eslint-config'

export default antfu(
  {
    rules: {
      'no-console': 'off',
      'test/consistent-test-it': 'off',
    },
  },
)
