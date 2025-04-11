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

export function verifyCode(): PropertyDecorator {
    return (target: Object, propertyKey: string | symbol) => {
        const codeRegex = /^[0-9]$/;
        Reflect.defineMetadata('codeRegex', codeRegex, target, propertyKey);
    }
}

export function validateDto(dto: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    for (const key of Object.keys(dto)) {
        const value = dto[key];
        console.log(`Validating property '${key}' with value '${value}'`);

        // Validate email
        const emailRegex = Reflect.getMetadata('emailRegex', dto, key);
        if (emailRegex && (typeof value !== 'string' || !emailRegex.test(value))) {
            errors.push(`Invalid email format for property '${key}'.`);
        }

        // Validate length 
        const lengthRange = Reflect.getMetadata('lengthRange', dto, key);
        if (lengthRange) {
            const { min, max } = lengthRange;
            if (typeof value !== 'string' || value.length < min || value.length > max) {
                errors.push(`Property '${key}' must be between ${min} and ${max} characters.`);
            }
        }

        // Validate password
        const passwordRegex = Reflect.getMetadata('passwordRegex', dto, key);
        if (passwordRegex && (typeof value !== 'string' || !passwordRegex.test(value))) {
            errors.push(`Invalid password format for property '${key}'. Password must include at least one uppercase letter, one lowercase letter, and one number.`);
        }

        // Validate name
        const nameRegex = Reflect.getMetadata('nameRegex', dto, key);
        if (nameRegex && (typeof value !== 'string' || !nameRegex.test(value))) {
            errors.push(`Invalid name format for property '${key}'. Only alphabetic characters are allowed.`);
        }

        // Validate code
        const codeRegex = Reflect.getMetadata('codeRegex', dto, key);
        if (codeRegex && (typeof value !== 'string' || !codeRegex.test(value))) {
            errors.push(`Invalid code format for property '${key}'.`);
        }
    }

    return {
        valid: errors.length === 0,
        errors,
    };
}