import { verifyLength, verifyPassword } from '../../decorator/decorator.dto.js';

export class ChangePasswordDto {
    @verifyPassword()
    @verifyLength(8, 64)
    oldPassword1!: string;

    @verifyPassword()
    @verifyLength(8, 64)
    oldPassword2!: string;

    @verifyPassword()
    @verifyLength(8, 64)
    newPassword!: string;

    userId!: number;
}