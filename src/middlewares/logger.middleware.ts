
import { Injectable, NestMiddleware } from '@nestjs/common';
import { isEmpty } from 'class-validator';
import { Request, Response, NextFunction } from 'express';
import { colorize } from 'src/constants/logColor.constant';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    console.log(
      colorize(req.method).magenta + '::',
      colorize(req.originalUrl).cyan,
      colorize(req.ip).white + ' -',
      new Date().toLocaleString(),
    );
    if (req.method !== 'GET') {
      console.log(req.body);
    }
    next();
  }
}
