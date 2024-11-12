import { Injectable } from '@nestjs/common';
import { Cat } from './interfaces/cat.interface';

@Injectable()
export class CatsService {
  private defaultCat: Cat = {
    name: 'Tom',
    age: 5,
    breed: 'Persian',
  };
  private readonly cats: Cat[] = [this.defaultCat];

  create(cat: Cat) {
    this.cats.push(cat);
    return { msg: 'cat created' };
  }

  findAll(): Cat[] {
    return this.cats;
  }
}
