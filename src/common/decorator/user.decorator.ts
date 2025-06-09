import {
  createParamDecorator,
  ExecutionContext,
  BadRequestException,
} from '@nestjs/common';
import { RequestWithUser } from 'src/auth/interfaces';

export const GetUserId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    const request: RequestWithUser = ctx.switchToHttp().getRequest();
    const userId = request.user?.sub;
    if (!userId) throw new BadRequestException('Invalid request');
    return userId;
  },
);
