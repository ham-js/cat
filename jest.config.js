/** @type {import('ts-jest').JestConfigWithTsJest} **/

module.exports = {
  coveragePathIgnorePatterns: [
    "index.ts"
  ],
  modulePaths: ["./src"],
  rootDir: "./src",
  testEnvironment: "node",
  testPathIgnorePatterns: ["node_modules/*", "test/e2e/*"],
  transform: {
    "^.+\.tsx?$": ["ts-jest",{}],
  },
};
