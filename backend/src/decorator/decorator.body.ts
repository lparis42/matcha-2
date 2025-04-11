import { createParamDecorator, ExecutionContext, BadRequestException } from '@nestjs/common';
import { validateDto } from './decorator.dto.js';

export const ValidateBody = (dto: any) =>
    createParamDecorator((data: unknown, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        const body = request.body;

        // Instanciation correcte du DTO
        const dtoInstance = new dto();
        Object.assign(dtoInstance, body);

        // Validation du DTO
        const validation = validateDto(dtoInstance);

        if (!validation.valid) {
            throw new BadRequestException(`Validation failed: ${validation.errors.join(' ')}`);
        }

        return dtoInstance;
    })();