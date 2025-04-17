import { createParamDecorator, ExecutionContext, BadRequestException } from '@nestjs/common';
import { validateDto } from './decorator.dto.js';

export const ValidateParam = (dto: any) =>
    createParamDecorator((data: string, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        const paramValue = request.params[data];

        const dtoInstance = new dto();
        Object.assign(dtoInstance, { [data]: paramValue });

        const validation = validateDto(dtoInstance);

        if (!validation.valid) {
            throw new BadRequestException(`Validation failed: ${validation.errors.join(' ')}`);
        }

        return dtoInstance;
    })();