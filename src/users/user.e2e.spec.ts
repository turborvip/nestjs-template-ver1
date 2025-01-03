import * as request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { UsersModule } from './users.module';
import { AuthModule } from '../auth/auth.module';
import { DatabaseModule } from '../database/database.module';
import { JwtService } from '@nestjs/jwt';
import { RedisService } from '../database/redis.service';

describe('2e2 for Users', () => {
  let app: INestApplication;
  let moduleRef: TestingModule;
  let redisService: RedisService;
  const accountAdmin = { username: 'john', password: '123456a' };
  const accountUser = { username: 'maria', password: '123456a' };

  const changePasswordData = {
    username: 'john',
    oldPassword: '123456a',
    newPassword: '1234567a',
  };
  let access_token: string;

  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [UsersModule, AuthModule, DatabaseModule],
      providers: [
        JwtService,
        RedisService,
      ],
    }).compile();

    app = moduleRef.createNestApplication();

    await app.init();
    redisService = moduleRef.get<RedisService>(RedisService);
    redisService.clearAll();

    const result = await request(app.getHttpServer())
      .post('/auth/login')
      .send(accountAdmin);

    access_token = result.body.access_token;
  });

  afterEach(async () => {
    await app.close();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('User login', () => {
    it(`/Post using account`, async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send(accountAdmin)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('access_token');
          expect(res.body.access_token).toEqual(expect.any(String)); // Check that access_token is a string
        });
    });
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

    it(`/GET profile but don't have role`, async () => {
      const result = await request(app.getHttpServer())
        .post('/auth/login')
        .send(accountUser)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('access_token');
          expect(res.body.access_token).toEqual(expect.any(String)); // Check that access_token is a string
        });
      const tokenUser = result.body.access_token;

      return await request(app.getHttpServer())
        .get('/user/profile')
        .set('Authorization', `Bearer ${tokenUser}`)
        .expect(401)
        .expect({
          message: 'Invalid or expired token',
          error: 'Unauthorized',
          statusCode: 401,
        });
    });
  });

  describe('Change password', () => {
    it(`/Post change password without login`, () => {
      return request(app.getHttpServer())
        .post('/user/change-password')
        .expect(401)
        .expect({
          message: 'Unauthorized',
          statusCode: 401,
        });
    });
    it(`/Post change password with wrong username`, async () => {
      await request(app.getHttpServer())
        .post('/user/change-password')
        .set('Authorization', `Bearer ${access_token}`)
        .send({ ...changePasswordData, username: 'xxx' })
        .expect(500)
        .expect({
          error: 'Usernames wrong!',
        });
    });

    it(`/Post change password with wrong old password`, async () => {
      await request(app.getHttpServer())
        .post('/user/change-password')
        .set('Authorization', `Bearer ${access_token}`)
        .send({ ...changePasswordData, oldPassword: 'xxx' })
        .expect(500)
        .expect({
          error: 'Wrong password',
        });
    });

    it(`/Post change password with true password`, async () => {
      const result = await request(app.getHttpServer())
        .post('/auth/login')
        .send(accountAdmin);

      const newToken = result.body.access_token;

      await request(app.getHttpServer())
        .post('/user/change-password')
        .set('Authorization', `Bearer ${newToken}`)
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
