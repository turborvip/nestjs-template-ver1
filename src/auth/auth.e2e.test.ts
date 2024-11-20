import * as request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AuthModule } from './auth.module';
import { DatabaseModule } from '../database/database.module';
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from '../roles/roles.guard';
import { JwtService } from '@nestjs/jwt';
import { RedisService } from '../database/redis.service';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { UsersModule } from '../users/users.module';
import { userProviders } from '../users/user.providers';

describe('2e2 for Auth', () => {
  let app: INestApplication;
  let moduleRef: TestingModule;
  let jwtService: JwtService;
  const accountAdmin = { username: 'john', password: '123456a' };
  let access_token: string;
  let authService: AuthService;
  let redisService: RedisService;

  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [AuthModule, DatabaseModule, UsersModule],
      providers: [
        AuthService,
        RedisService,
        JwtService,
        UsersService,
        ...userProviders,
        {
          provide: APP_GUARD,
          useClass: RolesGuard,
        },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    jwtService = moduleRef.get<JwtService>(JwtService);
    authService = moduleRef.get<AuthService>(AuthService);
    redisService = moduleRef.get<RedisService>(RedisService);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(async () => {
    await redisService.clearAll();
  });

  describe('Login', () => {
    it(`/Post using right account`, async () => {
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

    it(`/Post using wrong password`, async () => {
      return await request(app.getHttpServer())
        .post('/auth/login')
        .send({ ...accountAdmin, password: 'xxx' })
        .expect(401)
        .expect({ error: 'Wrong password' });
    });

    it(`/Post using wrong username`, async () => {
      return await request(app.getHttpServer())
        .post('/auth/login')
        .send({ ...accountAdmin, username: 'xxx' })
        .expect(401)
        .expect({ error: 'User not found' });
    });

    it(`/Post error system`, async () => {
      const errorMessage = 'Login failed';
      const spyAuthServiceLogout = jest
        .spyOn(authService, 'login')
        .mockRejectedValue(new Error(errorMessage));

      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ ...accountAdmin, username: 'xxx' })
        .expect(500)
        .expect({ error: errorMessage });

      spyAuthServiceLogout.mockRestore();
    });
  });

  describe('Logout', () => {
    it(`/Post logout`, async () => {
      await request(app.getHttpServer())
        .post('/auth/logout')
        .set('Authorization', `Bearer ${access_token}`)
        .expect(200)
        .expect({
          message: 'Logout successful',
        });
    });

    it('/Post error system', async () => {
      const errorMessage = 'Logout failed';
      const spyAuthServiceLogout = jest
        .spyOn(authService, 'logout')
        .mockRejectedValue(new Error(errorMessage));

      const result = await request(app.getHttpServer())
        .post('/auth/login')
        .send(accountAdmin);
      const newToken = result.body.access_token;

      await request(app.getHttpServer())
        .post('/auth/logout')
        .set('Authorization', `Bearer ${newToken}`)
        .expect(500)
        .expect({ error: errorMessage });

      spyAuthServiceLogout.mockRestore();
    }, 20000);
  });

  describe('Using token have a problem', () => {
    it(`/GET profile with blacklisted token`, async () => {
      const result = await request(app.getHttpServer())
        .post('/auth/login')
        .send(accountAdmin);
      const newToken = result.body.access_token;

      await redisService.addToBlacklist({ token: newToken });

      await request(app.getHttpServer())
        .get('/user/profile')
        .set('Authorization', `Bearer ${newToken}`)
        .expect(401)
        .expect({
          message: 'Token is blacklisted',
          error: 'Unauthorized',
          statusCode: 401,
        });
    });

    it(`/GET profile with wrong token with null roles`, async () => {
      const result = jwtService.sign({
        username: 'xxx',
        sub: 'xxx',
      });
      return await request(app.getHttpServer())
        .get('/user/profile')
        .set('Authorization', `Bearer ${result}`)
        .expect(401)
        .expect({
          message: 'Invalid or expired token',
          error: 'Unauthorized',
          statusCode: 401,
        });
    }, 10000);
  });
});
