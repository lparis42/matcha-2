import { verifyLength, verifyPassword, verifyName } from '../decorator/decorator.dto.js';

export class SignInDto {
    @verifyName()
    @verifyLength(6, 20)
    username!: string;

    @verifyPassword()
    @verifyLength(8, 64)
    password!: string;
}