import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    const message = 'Subply API is online! 👌';
    return message; 
  }
}
