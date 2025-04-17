import { HttpException, HttpStatus, Injectable, Logger } from "@nestjs/common/index.js";
import { UsersInterface } from "./interfaces/interface.users.js";
import { DatabaseService } from "../db/db.service.js";
import { UsersInterfaceMapper } from "./mapper/mapper.users-interface.js";
import { IdDto } from "./dto/dto.id.js";

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
    async getUserById(params: IdDto): Promise<{ user: UsersInterface, message: string }> {
        const { id } = params;
        const selectObject = this.databaseService.selectQuery('users', [], [id]);
        const result = await this.databaseService.execute(selectObject.query, selectObject.params);
        if (result.rowCount === 0) {
            this.logger.error(`User with ID ${id} not found`, UsersService.name);
            throw new HttpException('User not found', HttpStatus.NOT_FOUND);
        }
        const user = UsersInterfaceMapper(result.rows[0]);
        return { user, message: 'User found' };
    }

    /**
     * Retrieves all users.
     * @returns An array of users.
     */
    async getAllUsers(): Promise<{ users: UsersInterface[], message: string }> {
        const selectObject = this.databaseService.selectQuery('users', [], []);
        const result = await this.databaseService.execute(selectObject.query, selectObject.params);
        const users = result.rows.map((user: any) => UsersInterfaceMapper(user));
        return { users, message: 'Users found' };
    }
}