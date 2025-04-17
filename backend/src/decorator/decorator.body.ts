import { createParamDecorator, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { validateDto } from './decorator.dto.js';

export const ValidateBody = (dto: any) =>
    createParamDecorator((_: unknown, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        const body = request.body;

        const dtoInstance = new dto();
        Object.assign(dtoInstance, body);

        const validation = validateDto(dtoInstance);

        if (!validation.valid) {
            throw new HttpException(`Validation failed: ${validation.errors.join(' ')}`, HttpStatus.BAD_REQUEST);
        }

        return dtoInstance;
    })();