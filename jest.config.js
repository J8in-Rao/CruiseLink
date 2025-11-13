module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  transform: {
    '^.+\.(t|j)sx?$': ['@swc/jest'],
  },
  transformIgnorePatterns: ['/node_modules/(?!lucide-react)/'],
};
