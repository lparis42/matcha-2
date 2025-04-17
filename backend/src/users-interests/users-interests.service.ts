import {
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
} from '@nestjs/common/index.js';
import { DatabaseService } from '../db/db.service.js';
import { UpdateUsersInterestsDto } from './dto/dto.update-users-interests.js';
import { mapUpdateUsersInterestsDtoToDBUsersInterests } from './mapper/mapper.update-users-interests-dto-to-db-users-interests.js';

@Injectable()
export class UsersInterestsService {
  private readonly logger = new Logger(UsersInterestsService.name);

  constructor(private readonly databaseService: DatabaseService) {}

  /**
   * Updates the user's interests in the database.
   * @param body - The request body containing the user's interests.
   * @returns A message indicating the success of the operation.
   * @throws HttpException if the update fails.
   */
  async updateUsersInterests(
    body: UpdateUsersInterestsDto,
  ): Promise<{ message: string }> {
    const dbUsersInterests = mapUpdateUsersInterestsDtoToDBUsersInterests(body);

    const updateQuery = this.databaseService.updateQuery(
      'users_interests',
      [
        'technology',
        'sports',
        'music',
        'travel',
        'food',
        'movies',
        'books',
        'art',
        'nature',
        'fitness',
      ],
      `user_id = $1`,
      [
        dbUsersInterests.technology,
        dbUsersInterests.sports,
        dbUsersInterests.music,
        dbUsersInterests.travel,
        dbUsersInterests.food,
        dbUsersInterests.movies,
        dbUsersInterests.books,
        dbUsersInterests.art,
        dbUsersInterests.nature,
        dbUsersInterests.fitness,
      ],
      [dbUsersInterests.user_id]
    );
    const result = await this.databaseService.execute(
      updateQuery.query,
      updateQuery.params,
    );
    if (result.rowCount === 0) {
      this.logger.error(
        `Failed to update user interests for user ID: ${dbUsersInterests.user_id}`,
      );
      throw new HttpException(
        `Failed to update user interests for user ID: ${dbUsersInterests.user_id}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    this.logger.log(
      `User interests updated successfully for user ID: ${dbUsersInterests.user_id}`,
    );
    return { message: 'User interests updated successfully!' };
  }
}
