const path = require("path");

module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  rootDir: path.resolve(__dirname, "../../../backend"),
  roots: ["<rootDir>/../tests/functional/backend"],
  testMatch: ["<rootDir>/../tests/functional/backend/**/*.functional.spec.ts"],
  moduleFileExtensions: ["js", "json", "ts"],
  transform: {
    "^.+\\.(t|j)s$": [
      "ts-jest",
      {
        tsconfig: path.resolve(__dirname, "./tsconfig.json"),
      },
    ],
  },
  collectCoverageFrom: ["tests/functional/backend/**/*.(t|j)s"],
  coverageDirectory: "tests/functional/coverage/backend",
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  moduleDirectories: ["node_modules", "<rootDir>/node_modules"],
  testTimeout: 30000,
  setupFilesAfterEnv: ["<rootDir>/../tests/functional/backend/setup.ts"],
};
