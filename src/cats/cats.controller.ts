
import { Controller, Get, Post, Request } from '@nestjs/common';
import { CatsService } from './cats.service';
import { Cat } from './interfaces/cat.interface';

@Controller('cats')
export class CatsController {
    constructor(private readonly catsService: CatsService) {}
  @Get()
  findAll(): Cat[] {
    return this.catsService.findAll();
  }

  @Post('create')
  create(@Request() req): Object {
    return this.catsService.create(req.body);
  }
}
