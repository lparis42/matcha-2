import { verifyInteger } from '../../decorator/decorator.dto.js';

export class IdDto {
    @verifyInteger()
    id!: string;
}