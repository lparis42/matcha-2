import { Module } from "@nestjs/common/index.js";
import { UsersController } from "./users.controller.js";
import { UsersService } from "./users.service.js";
import { DatabaseModule } from "../db/db.module.js";

@Module({
    imports: [UsersModule, DatabaseModule],
    controllers: [UsersController],
    providers: [UsersService],
})
export class UsersModule { }