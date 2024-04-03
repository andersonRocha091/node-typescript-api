import { SetupServer } from '@src/server';
import supertest from 'supertest';

//it runs before everything
beforeAll(() => {
  const server = new SetupServer();
  server.init();
  //making server exposed globally
  (globalThis as any).testRequest = supertest(server.getApp());
  
})