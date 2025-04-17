import { verifyId } from "../../decorator/decorator.dto.js";

export class UserByIdDto {
    @verifyId()
    id!: number;
}