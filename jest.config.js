/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
  testEnvironment: "node",
  testPathIgnorePatterns: ["test/e2e/*"],
  transform: {
    "^.+\.tsx?$": ["ts-jest",{}],
  },
};
