import { Injectable } from '@nestjs/common';
import { Public } from './auth/public.decorator';

@Injectable()
export class AppService {
  @Public()
  getHello(): string {
    return 'Hello World!';
  }
}
