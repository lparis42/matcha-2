import { HttpException, HttpStatus, Injectable, Logger } from "@nestjs/common/index.js";
import { UserProfile } from "./interfaces/interface.users.js";
import { DatabaseService } from "../db/db.service.js";
import { UsersMapper } from "./mapper/mapper.users-interface.js";
import { IdDto } from "./dto/dto.id.js";
import { UserProfileDto } from "./dto/dto.user-profile.js";
import * as bcrypt from 'bcrypt';

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
    async getUserById(params: IdDto, userId: number): Promise<{ user: Partial<UserProfile>, message: string }> {
        const { id } = params;
        const selectObject = this.databaseService.selectQuery('users', [], [{ id }]);
        const result = await this.databaseService.execute(selectObject.query, selectObject.params);
        if (result.rowCount === 0) {
            this.logger.error(`User with ID ${id} not found`, UsersService.name);
            throw new HttpException('User not found', HttpStatus.NOT_FOUND);
        }
        const mappedUser = UsersMapper(result.rows[0]);
        const user = mappedUser.id !== userId ? { ...mappedUser, email: undefined } : mappedUser;
        return { user, message: 'User found' };
    }

    /**
     * Retrieves all users.
     * @returns An array of users.
     */
    async getAllUsers(): Promise<{ users: Partial<UserProfile>[], message: string }> {
        const selectObject = this.databaseService.selectQuery('users', [], []);
        const result = await this.databaseService.execute(selectObject.query, selectObject.params);
        const users = result.rows.map((user: any) => {
            const mappedUser = UsersMapper(user);
            return { ...mappedUser, email: undefined };
        });
        return { users, message: 'Users found' };
    }

    /**
    * Updates a user by their ID.
    * @param body - The request body containing the user information to update.
    * @param userId - The ID of the user to update.
    * @returns A message indicating the result of the update operation.
    * @throws HttpException if the update operation fails.
    **/
    async updateUser(body: UserProfileDto, userId: number): Promise<{ message: string }> {
        console.log('body', body);
        console.log('userId', userId);
        this.databaseService.beginTransaction();
        // Update users table
        const columnNames = Object.keys(body).filter((key, _) =>
            !!body[key as keyof UserProfileDto] &&
            typeof body[key as keyof UserProfileDto] !== 'object'
        );
        const values = columnNames.map(key => body[key as keyof UserProfileDto]);
        if (body.password) {
            const hashedPassword = await bcrypt.hash(body.password, 10);
            values[columnNames.indexOf('password')] = hashedPassword;
        }
        const updateObject = this.databaseService.updateQuery('users', columnNames, values, [{ id: userId }]);
        const result = await this.databaseService.execute(updateObject.query, updateObject.params);
        if (result.rowCount === 0) {
            this.databaseService.rollbackTransaction();
            this.logger.error(`Failed to update user with ID ${userId}`, UsersService.name);
            throw new HttpException('Failed to update user', HttpStatus.INTERNAL_SERVER_ERROR);
        }
        if (Array.isArray(body.interests) && body.interests.length > 0) {
            // Update users_interests table
            const interestColumns = Object.keys(body.interests[0]);
            const interestValues = Object.values(body.interests[0]);
            const updateInterestsObject = this.databaseService.updateQuery(
                'users_interests', interestColumns, interestValues, [{ id: userId }]
            );
            console.log('updateInterestsObject', updateInterestsObject);
            const interestResult = await this.databaseService.execute(
                updateInterestsObject.query, updateInterestsObject.params 
            );
            if (interestResult.rowCount === 0) {
                this.databaseService.rollbackTransaction();
                this.logger.error(`Failed to update interests for user with ID ${userId}`, UsersService.name);
                throw new HttpException('Failed to update interests', HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
        if (Array.isArray(body.pictures) && body.pictures.length > 0) {
            // Update users_pictures table
            const pictureColumns = Object.keys(body.pictures[0]);
            const pictureValues = Object.values(body.pictures[0]);
            console.log('pictureColumns', pictureColumns);
            const updatePicturesObject = this.databaseService.updateQuery(
                'users_pictures', pictureColumns, pictureValues, [{ id: userId }]
            );
            console.log('updatePicturesObject', updatePicturesObject);
            const pictureResult = await this.databaseService.execute(
                updatePicturesObject.query, updatePicturesObject.params
            );
            if (pictureResult.rowCount === 0) {
                this.databaseService.rollbackTransaction();
                this.logger.error(`Failed to update pictures for user with ID ${userId}`, UsersService.name);
                throw new HttpException('Failed to update pictures', HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
        this.databaseService.commitTransaction();
        this.logger.log(`User with ID ${userId} updated successfully`, UsersService.name);
        return { message: 'User updated successfully' };
    }
}