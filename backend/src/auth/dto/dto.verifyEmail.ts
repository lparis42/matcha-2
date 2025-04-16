import { verifyLength } from "../../decorator/decorator.dto.js";

export class VerifyEmailDto {
    @verifyLength(36, 36)
    uuid!: string;

    userId!: number;
}