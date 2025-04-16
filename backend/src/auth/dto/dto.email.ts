import { verifyEmail, verifyLength } from '../../decorator/decorator.dto.js';

export class EmailDto {
    @verifyEmail()
    @verifyLength(6, 255)
    email!: string;
}