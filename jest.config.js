/** Jest, yalnızca saf TS oyun çekirdeğini (src/core) test eder.
 *  React Native/Expo modülleri test kapsamı dışındadır; jest-expo bilinçli olarak kullanılmıyor. */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/src/core/**/*.test.ts'],
};
