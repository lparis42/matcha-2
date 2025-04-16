import { verifyEmail, verifyLength } from '../../decorator/decorator.dto.js';

export class ResetPasswordDto {
    @verifyEmail()
    @verifyLength(6, 255)
    email!: string;
}