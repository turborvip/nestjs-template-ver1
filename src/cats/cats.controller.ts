
import { Controller, Get } from '@nestjs/common';
import { CatsService } from './cats.service';
import { Cat } from './interfaces/cat.interface';
import { Roles } from 'src/roles/roles.decorator';
import { Role } from 'src/roles/roles.enum';

@Controller('cats')
export class CatsController {
    constructor(private readonly catsService: CatsService) {}
  @Get()
  findAll(): Cat[] {
    return this.catsService.findAll();
  }
}
