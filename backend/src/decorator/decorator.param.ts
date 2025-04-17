import { createParamDecorator, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { validateDto } from './decorator.dto.js';

export const ValidateParam = (dto: any) =>
    createParamDecorator((data: string, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        const paramValue = request.params[data];

        const dtoInstance = new dto();
        Object.assign(dtoInstance, { [data]: paramValue });

        const validation = validateDto(dtoInstance);

        if (!validation.valid) {
            throw new HttpException(`Validation failed: ${validation.errors.join(' ')}`, HttpStatus.BAD_REQUEST);
        }

        return dtoInstance;
    })();