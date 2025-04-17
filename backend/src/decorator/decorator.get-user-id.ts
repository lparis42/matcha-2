// get Id from user decorator
import { createParamDecorator, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';

export const GetUserId = createParamDecorator(
    (_: unknown, ctx: ExecutionContext): number => {
        const request = ctx.switchToHttp().getRequest();
        if (!request.user || !request.user.id) {
            throw new HttpException('User not found', HttpStatus.UNAUTHORIZED);
        }
        return request.user.id;
    }
);