// src/shared/config/jest.config.js
const path = require('path');

module.exports = {
  // Faz o rootDir voltar para a raiz real do projeto
  rootDir: path.resolve(__dirname, '../../../'),
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['<rootDir>/src/modules/**/*.spec.ts'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
};
