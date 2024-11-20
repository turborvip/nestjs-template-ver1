import * as request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { UsersModule } from './users.module';
import { AuthModule } from '../auth/auth.module';
import { DatabaseModule } from '../database/database.module';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from '../roles/roles.guard';
import { JwtService } from '@nestjs/jwt';
import { RedisService } from '../database/redis.service';


describe('2e2 for Users', () => {
  let app: INestApplication;
  let moduleRef: TestingModule;
  let redisService: RedisService;
  let accountAdmin = { username: 'john', password: '123456a' };
  let accountUser = { username: 'maria', password: '123456a' };

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
      ],
      providers: [
        JwtService,
        RedisService,
        {
          provide: APP_GUARD,
          useClass: RolesGuard,
        },
      ],
    }).compile();

    app = moduleRef.createNestApplication();

    await app.init();
    redisService = moduleRef.get<RedisService>(RedisService);
    redisService.clearAll();
  });

  describe('User login', () => {
    it(`/Post using account`, async () => {
      const result = await request(app.getHttpServer())
        .post('/auth/login')
        .send(accountAdmin)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('access_token');
          expect(res.body.access_token).toEqual(expect.any(String)); // Check that access_token is a string
        });
      access_token = result.body.access_token;
      return result;
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
      let tokenUser = result.body.access_token;

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
    },20000);
    it(`/Post change password with wrong username`, async () => {
      return request(app.getHttpServer())
        .post('/user/change-password')
        .set('Authorization', `Bearer ${access_token}`)
        .send({ ...changePasswordData, username: 'xxx' })
        .expect(500)
        .expect({
          error: 'Usernames wrong!',
        });
    },20000);

    it(`/Post change password with wrong old password`, async () => {
      return request(app.getHttpServer())
        .post('/user/change-password')
        .set('Authorization', `Bearer ${access_token}`)
        .send({ ...changePasswordData, oldPassword: 'xxx' })
        .expect(500)
        .expect({
          error: 'Wrong password',
        });
    },20000);

    it(`/Post change password with true password`, async () => {
      return request(app.getHttpServer())
        .post('/user/change-password')
        .set('Authorization', `Bearer ${access_token}`)
        .send({ ...changePasswordData })
        .expect(200)
        .expect({
          message: 'Password changed successfully',
        });
    },20000);

  });

  afterAll(async () => {
    await app.close();
  });
});
