import { verifyEmail, verifyLength, verifyPassword, verifyName } from '../decorator/decorator.dto.js';

export class SignUpDto {
    @verifyEmail()
    @verifyLength(6, 255)
    email!: string;

    @verifyName()
    @verifyLength(6, 20)
    username!: string;

    @verifyPassword()
    @verifyLength(8, 64)
    password!: string;

    @verifyName()
    @verifyLength(3, 20)
    firstName!: string;

    @verifyName()
    @verifyLength(3, 20)
    lastName!: string;
}