import { Controller, Get, Param, UseGuards } from "@nestjs/common/index.js";
import { UsersService } from "./users.service.js";
import { UsersInterface } from "./interfaces/interface.users.js";
import { CookieAuthGuard } from "../auth/guards/guard.cookie.js";
import { IdDto } from "./dto/dto.id.js";
import { ValidateParam } from "../decorator/decorator.param.js";

@Controller('users')
export class UsersController {
    constructor(
        private readonly usersService: UsersService,
    ) { }

    @Get('')
    @UseGuards(CookieAuthGuard)
    async getAllUsers(): Promise<{ users: UsersInterface[] }> {
        const result = await this.usersService.getAllUsers();
        return result;
    }

    @Get(':id')
    @UseGuards(CookieAuthGuard)
    async getUserById(
        @ValidateParam(IdDto) params: IdDto,
    ): Promise<{ user: UsersInterface }> {
        const result = await this.usersService.getUserById(params);
        return result;
    }
}