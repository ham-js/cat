/** @type {import('ts-jest').JestConfigWithTsJest} **/

module.exports = {
  modulePaths: ["./src"],
  testEnvironment: "node",
  testPathIgnorePatterns: ["node_modules/*", "test/e2e/*"],
  transform: {
    "^.+\.tsx?$": ["ts-jest",{}],
  },
};
