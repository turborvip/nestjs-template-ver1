import { Test, TestingModule } from '@nestjs/testing';
import { CatsController } from './cats.controller';
import { CatsService } from './cats.service';
import { Cat } from './interfaces/cat.interface';

describe('AppController', () => {
  let app: TestingModule;

  beforeAll(async () => {
    app = await Test.createTestingModule({
      controllers: [CatsController],
      providers: [CatsService],
    }).compile();
  });

  describe('get cats', () => {
    it('get cats return array object of cats', () => {
      const catsController = app.get(CatsController);
      expect(catsController.findAll()).toStrictEqual([
        {
          name: 'Tom',
          age: 5,
          breed: 'Persian',
        },
      ]);
    });
  });

  describe('create a cats', () => {
    it('create a cat', () => {
      const catsController = app.get(CatsController);
      const newCat: Cat = {
        name: 'BigMom',
        age: 8,
        breed: 'BaTu',
      };
      expect(catsController.create(newCat)).toEqual({
        msg: 'cat created',
      });
    });
  });
});
