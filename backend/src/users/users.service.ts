import { HttpException, HttpStatus, Injectable, Logger } from "@nestjs/common/index.js";
import { UserInfo } from "./interfaces/interface.user-info.js";
import { UserByIdDto } from "./dto/dto.user-by-id.js";
import { DatabaseService } from "../db/db.service.js";
import { mapDBUserToUserInfo } from "./mapper/mapper.db-user-to-user-info.js";

@Injectable()
export class UsersService {
    private readonly logger = new Logger(UsersService.name);

    constructor(
        private readonly databaseService: DatabaseService,
    ) { }

    async getUserById(body: UserByIdDto): Promise<{ user: UserInfo }> {
        const { id } = body;

        this.logger.debug(`Fetching user with ID: ${id}`);
        const selectObject = this.databaseService.selectQuery(
            'users',
            [],
            `id = $1`,
            [id]
        );
        this.logger.debug(`Executing query: ${selectObject.query} with params: ${JSON.stringify(selectObject.params)}`);
        const result = await this.databaseService.execute(selectObject.query, selectObject.params);
        if (result.rowCount === 0) {
            this.logger.error(`User with ID ${id} not found`);
            throw new HttpException('User not found', HttpStatus.NOT_FOUND);
        }
        const user = mapDBUserToUserInfo(result.rows[0]);
        return { user };
    }

    async getAllUsers(): Promise<{ id: number, name: string }[]> {
        // Simulate a database call
        return [
            { id: 1, name: "John Doe" },
            { id: 2, name: "Jane Doe" },
        ];
    }
}