import 'reflect-metadata';

export function verifyEmail(): PropertyDecorator {
    return (target: Object, propertyKey: string | symbol) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        Reflect.defineMetadata('emailRegex', emailRegex, target, propertyKey);
    };
}

export function verifyLength(min: number, max: number): PropertyDecorator {
    return (target: Object, propertyKey: string | symbol) => {
        const lengthRange = { min, max };
        Reflect.defineMetadata('lengthRange', lengthRange, target, propertyKey);
    };
}

export function verifyPassword(): PropertyDecorator {
    return (target: Object, propertyKey: string | symbol) => {
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]+$/;
        Reflect.defineMetadata('passwordRegex', passwordRegex, target, propertyKey);
    };
}

export function verifyName(): PropertyDecorator {
    return (target: Object, propertyKey: string | symbol) => {
        const nameRegex = /^[a-zA-Z]+$/;
        Reflect.defineMetadata('nameRegex', nameRegex, target, propertyKey);
    }
}

export function verifyUUID(): PropertyDecorator {
    return (target: Object, propertyKey: string | symbol) => {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        Reflect.defineMetadata('uuidRegex', uuidRegex, target, propertyKey);
    }
}

export function validateDto(dto: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    for (const key of Object.keys(dto)) { 
        const value = dto[key];

        const emailRegex = Reflect.getMetadata('emailRegex', dto, key);
        if (emailRegex && (typeof value !== 'string' || !emailRegex.test(value))) {
            errors.push(`Property '${key}' must be a valid email address.`);
        }

        const lengthRange = Reflect.getMetadata('lengthRange', dto, key);
        if (lengthRange) {
            const { min, max } = lengthRange;
            if (typeof value !== 'string' || value.length < min || value.length > max) {
                errors.push(`Property '${key}' must be between ${min} and ${max} characters.`);
            }
        }

        const passwordRegex = Reflect.getMetadata('passwordRegex', dto, key);
        if (passwordRegex && (typeof value !== 'string' || !passwordRegex.test(value))) {
            errors.push(`Property '${key}' must include at least one uppercase letter, one lowercase letter, and one number.`);
        }

        const nameRegex = Reflect.getMetadata('nameRegex', dto, key);
        if (nameRegex && (typeof value !== 'string' || !nameRegex.test(value))) {
            errors.push(`Property '${key}' must only contain letters.`);
        }

        const uuidRegex = Reflect.getMetadata('uuidRegex', dto, key);
        if (uuidRegex && (typeof value !== 'string' || !uuidRegex.test(value))) {
            errors.push(`Property '${key}' must be a valid UUID v4.`);
        }
    }

    return {
        valid: errors.length === 0,
        errors,
    };
}