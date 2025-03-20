/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
  testEnvironment: "node",
  testPathIgnorePatterns: ["node_modules/*", "test/e2e/*"],
  transform: {
    "^.+\.tsx?$": ["ts-jest",{}],
  },
};
