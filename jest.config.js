module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
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
