export default {
  '**/*.{js,jsx}': ['eslint'],
  '**/*.{ts,tsx}': ['eslint', () => 'tsc --build'],
}
