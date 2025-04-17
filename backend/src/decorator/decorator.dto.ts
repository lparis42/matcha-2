import 'reflect-metadata';
import { GENDERS, INTEREST_KEYS, PICTURES_KEYS, SEXUAL_PREFERENCES } from '../users/interfaces/interface.users.js';

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

export function verifyInteger(): PropertyDecorator {
    return (target: Object, propertyKey: string | symbol) => {
        const integerRegex = /^-?\d+$/;
        Reflect.defineMetadata('integerRegex', integerRegex, target, propertyKey);
    }
}

export function verifyBoolean(): PropertyDecorator {
    return (target: Object, propertyKey: string | symbol) => {
        Reflect.defineMetadata('booleanRegex', true, target, propertyKey);
    };
}

export function verifyDate(): PropertyDecorator {
    return (target: Object, propertyKey: string | symbol) => {
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/; // YYYY-MM-DD format
        Reflect.defineMetadata('dateRegex', dateRegex, target, propertyKey);
    };
}
export function verifyGender(): PropertyDecorator {
    return (target: Object, propertyKey: string | symbol) => {
        Reflect.defineMetadata('validGenders', GENDERS, target, propertyKey);
    };
}

export function verifySexualPreferences(): PropertyDecorator {
    return (target: Object, propertyKey: string | symbol) => {
        Reflect.defineMetadata('validPreferences', SEXUAL_PREFERENCES, target, propertyKey);
    };
}

export function verifyInterests(): PropertyDecorator {
    return (target: Object, propertyKey: string | symbol) => {
        Reflect.defineMetadata('validInterests', INTEREST_KEYS, target, propertyKey);
        Reflect.defineMetadata('interestsAreBooleans', true, target, propertyKey);
    };
}

export function verifyPictures(): PropertyDecorator {
    return (target: Object, propertyKey: string | symbol) => {
        Reflect.defineMetadata('validPictures', PICTURES_KEYS, target, propertyKey);
        Reflect.defineMetadata('isImage', 'string', target, propertyKey);
    };
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

        const integerRegex = Reflect.getMetadata('integerRegex', dto, key);
        if (integerRegex && (typeof value !== 'string' || !integerRegex.test(value))) {
            errors.push(`Property '${key}' must be a valid integer.`);
        }

        const isBoolean = Reflect.getMetadata('isBoolean', dto, key);
        if (isBoolean && value !== undefined && typeof value !== 'boolean') {
            errors.push(`Property '${key}' must be a boolean.`);
        }

        const dateRegex = Reflect.getMetadata('dateRegex', dto, key);
        if (dateRegex && (typeof value !== 'string' || !dateRegex.test(value))) {
            errors.push(`Property '${key}' must be a valid date in YYYY-MM-DD format.`);
        }

        const validGenders = Reflect.getMetadata('validGenders', dto, key);
        if (validGenders && !validGenders.includes(value)) {
            errors.push(`Property '${key}' must be one of the following: ${validGenders.join(', ')}.`);
        }

        const validPreferences = Reflect.getMetadata('validPreferences', dto, key);
        if (validPreferences && !validPreferences.includes(value)) {
            errors.push(`Property '${key}' must be one of the following: ${validPreferences.join(', ')}.`);
        }
        console.log(value);

        const validInterests = Reflect.getMetadata('validInterests', dto, key);
        const interestsAreBooleans = Reflect.getMetadata('interestsAreBooleans', dto, key);
        if (validInterests && interestsAreBooleans) {
            const invalidValues = value.filter(
                (k: string) => !(typeof value[k] !== 'boolean' || !validInterests.includes(k))
            );
            console.log(invalidValues);
            if (invalidValues.length > 0) {
                errors.push(
                    `Property '${key}' must be an object with keys ${validInterests.join(', ')}, all with boolean values.`
                );
            }
        }

        const validPictures = Reflect.getMetadata('validPictures', dto, key);
        const isImage = Reflect.getMetadata('isImage', dto, key);

        if (validPictures && isImage) {
            const invalidValues = value.filter(
                (k: string) => !(typeof value[k] !== 'string' || !validPictures.includes(k))
            );
            console.log(invalidValues);
            if (invalidValues.length > 0) {
                errors.push(
                    `Property '${key}' must be an object with keys ${validPictures.join(', ')}, all with string values.`
                );
            }
        }
    }

    return { valid: errors.length === 0, errors };
}