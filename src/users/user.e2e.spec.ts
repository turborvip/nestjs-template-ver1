import * as request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { UsersModule } from './users.module';
import { AuthModule } from '../auth/auth.module';
import { DatabaseModule } from '../database/database.module';
import { ConfigModule } from '@nestjs/config';

describe('2e2 for Users', () => {
  let app: INestApplication;
  let moduleRef: TestingModule;
  let account = { username: 'john', password: '123456a' };
  let changePasswordData = {
    username: 'john',
    oldPassword: '123456a',
    newPassword: '1234567a',
  };
  let access_token: string;

  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [
        UsersModule,
        AuthModule,
        DatabaseModule,
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env',
        }),
      ],
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
    it(`/GET profile after login`, async () => {
      return request(app.getHttpServer())
        .get('/user/profile')
        .set('Authorization', `Bearer ${access_token}`)
        .expect(200)
        .expect('hi');
    });
  });

  describe('Change password', () => {
    it(`/Post change password without login`, () => {
      return request(app.getHttpServer())
        .post('/user/change-password')
        .expect(401)
        .expect({
          message: 'Unauthorized',
          statusCode: 401
        });
    });
    it(`/Post change password with wrong username`, async () => {
      return request(app.getHttpServer())
        .post('/user/change-password')
        .set('Authorization', `Bearer ${access_token}`)
        .send({ ...changePasswordData, username: 'xxx' })
        .expect(500)
        .expect({
          error: 'Usernames wrong!',
        });
    });

    it(`/Post change password with wrong old password`, async () => {
      return request(app.getHttpServer())
        .post('/user/change-password')
        .set('Authorization', `Bearer ${access_token}`)
        .send({ ...changePasswordData, oldPassword: 'xxx' })
        .expect(500)
        .expect({
          error: 'Wrong password',
        });
    });
    it(`/Post change password with true password`, async () => {
      return request(app.getHttpServer())
        .post('/user/change-password')
        .set('Authorization', `Bearer ${access_token}`)
        .send({ ...changePasswordData })
        .expect(200)
        .expect({
          message: 'Password changed successfully',
        });
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
