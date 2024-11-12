import { Controller, Get, Post, Request } from '@nestjs/common';
import { CatsService } from './cats.service';
import { Cat } from './interfaces/cat.interface';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@Controller('cats')
@ApiTags('cats')
export class CatsController {
  constructor(private readonly catsService: CatsService) {}
  @Get()
  @ApiOperation({ summary: 'Get all cats' })
  @ApiResponse({ status: 200, description: 'All cats' })
  findAll(): Cat[] {
    return this.catsService.findAll();
  }

  @Post('create')
  @ApiOperation({ summary: 'Create a cat' })
  @ApiResponse({ status: 200, description: 'cat created' })
  create(@Request() req): Object {
    return this.catsService.create(req.body);
  }
}
