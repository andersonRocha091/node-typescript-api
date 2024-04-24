import { SetupServer } from '@src/server';
import supertest from 'supertest';

//it runs before everything
let server: SetupServer;
beforeAll(async () => {
  server = new SetupServer();
  await server.init();
  //making server exposed globally
  (globalThis as any).testRequest = supertest(server.getApp());
  
});

afterAll(async () => {
  await server.close();
})