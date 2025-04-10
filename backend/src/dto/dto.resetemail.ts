import { verifyEmail, verifyLength, verifyCode } from '../decorator/decorator.dto.js';

export class ResetEmailDto {
    @verifyCode()
    @verifyLength(6, 6)
    code!: string;

    @verifyEmail()
    @verifyLength(6, 255)
    email!: string;
}