module.exports = {
  preset: "ts-jest",
  testEnvironment: "jest-environment-jsdom-global",
  moduleFileExtensions: ["ts", "js"],
  transform: {
    "^.+\\.(ts)$": "ts-jest",
  },
  globals: {
    "ts-jest": {
      tsconfig: "./tsconfig.test.json",
    },
  },
  testMatch: ["**/**.test.ts"],
};
