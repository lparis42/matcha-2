import { verifyUUID } from "../../decorator/decorator.dto.js";

export class UUIDDto {
    @verifyUUID()
    uuid!: string;
}