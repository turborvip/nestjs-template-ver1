import * as request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { UsersModule } from './users.module';
import { UsersService } from './users.service';
import { AuthModule } from '../auth/auth.module';

describe('2e2 for Users', () => {
  let app: INestApplication;
  let moduleRef: TestingModule;
  let account = { username: 'john', password: 'changeme' };
  let access_token: string;

  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [UsersModule, AuthModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  describe('User login', () => {
    it(`/Post using account`, async () => {
      const result = await request(app.getHttpServer())
        .post('/auth/login')
        .send(account)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('access_token');
          expect(res.body.access_token).toEqual(expect.any(String)); // Check that access_token is a string
        });
      access_token = result.body.access_token;
      return result;
    }, 10000);
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
      return request(app.getHttpServer())
        .get('/user/profile')
        .set('Authorization', `Bearer ${access_token}`)
        .expect(200)
        .expect('hi');
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
