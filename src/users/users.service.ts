import { Inject, Injectable } from '@nestjs/common';
import { Role } from '../roles/roles.enum';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { hashUtil } from '../util/hash.util';
import { RedisService } from '../database/redis.service';

@Injectable()
export class UsersService {
  constructor(
    @Inject('USER_REPOSITORY')
    private userRepository: Repository<User>,
    private readonly redisService: RedisService,
  ) {}

  async onApplicationBootstrap() {
    const users = [
      {
        userId: 1,
        username: 'john',
        roles: [Role.Admin, Role.User],
        password: await hashUtil.hash('123456a'),
      },
      {
        userId: 2,
        username: 'maria',
        roles: [Role.User],
        password: await hashUtil.hash('123456a'),
      },
    ];
    await this.userRepository.upsert(users, {
      conflictPaths: ['username'],
      skipUpdateIfNoValuesChanged: true,
      upsertType: 'on-conflict-do-update',
    });
  }

  async findOne(username: string): Promise<User> | undefined {
    const cacheResult = await this.redisService.getKeyWithDecrypt(
      'user-' + username,
    );
    if (cacheResult) {
      cacheResult.isFromCache = true;
      return cacheResult;
    }
    const result = await this.userRepository.findOne({
      where: { username: username },
    });
    if (result) {
      const { password, ...dataCache } = result;
      await this.redisService.setKeyWithEncrypt({
        key: 'user-' + result.username,
        value: JSON.stringify(result),
      });
    }
    return result;
  }

  /**
   * Changes the password of a user.
   *
   * @param user - The current authenticated user object.
   * @param username - The username of the user whose password is to be changed.
   * @param oldPassword - The current password of the user.
   * @param newPassword - The new password to set for the user.
   * @throws Will throw an error if the provided username does not match the authenticated user's username.
   * @throws Will throw an error if the oldPassword does not match the user's current password in the database.
   */
  async changePassword(
    user: User,
    username: string,
    oldPassword: string,
    newPassword: string,
  ): Promise<void> {
    if (user?.username !== username) {
      throw new Error('Usernames wrong!');
    }

    const userPasswordFromDB = await this.userRepository.findOne({
      where: { username: username },
      select: { password: true },
    });

    if (
      userPasswordFromDB &&
      (await hashUtil.compare(oldPassword, userPasswordFromDB.password))
    ) {
      await this.userRepository.update(
        { username: username },
        { password: await hashUtil.hash(newPassword) },
      );
      this.redisService.delKey('user-' + username);
    } else {
      throw new Error('Wrong password');
    }
  }
}
