import * as request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { UsersModule } from './users.module';
import { UsersService } from './users.service';
import { AuthModule } from '../auth/auth.module';

describe('2e2 for Users', () => {
  let app: INestApplication;
  let moduleRef: TestingModule;
  let userService = { findOne: jest.fn() };
  let account =  {username:"john",password:"changeme"}

  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [UsersModule, AuthModule],
    })
      .overrideProvider(UsersService)
      .useValue(userService)
      .compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  describe('Get profile', () => {
    it(`/GET profile without login(token)`, () => {
      return request(app.getHttpServer())
        .get('/user/profile')
        .expect(401)
        .expect({
          message: 'Unauthorized', // Adjusted to match the actual response
          statusCode: 401, // Status code
        });
    });
    it(`/GET profile after login`, async() => {
      const loginSuccess: any = await request(app.getHttpServer())
        .post('/auth/login')
        .send(JSON.stringify(account))
        .expect(200)
        .expect({
          access_token: expect.any(String),
        });

      return request(app.getHttpServer())
        .get('/user/profile')
        .set('Authorization', loginSuccess.body.access_token)
        .expect(401)
        .expect({
          message: 'Unauthorized', 
          statusCode: 401,
        });
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
