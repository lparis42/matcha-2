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

    /**
     * Retrieves a user by their ID.
     * @param body - The request body containing the user ID.
     * @returns The user information.
     * @throws HttpException if the user is not found.
     */
    async getUserById(body: UserByIdDto): Promise<{ user: UserInfo }> {
        const { id } = body;

        const selectObject = this.databaseService.selectQuery(
            'users',
            [],
            `id = $1`,
            [id]
        );
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