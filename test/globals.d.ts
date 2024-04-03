// declare namespace NodeJS{
//   interface Global{
//     testRequest: import('supertest').SuperTest<import('supertest').Test>;
//   }
// }

declare global {
  function testRequest(): import('supertest').SuperTest<import('supertest').Test>;
}