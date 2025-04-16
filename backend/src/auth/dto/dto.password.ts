import { verifyLength, verifyPassword } from '../../decorator/decorator.dto.js';

export class PasswordDto {
    @verifyPassword()
    @verifyLength(8, 64)
    password!: string;
}