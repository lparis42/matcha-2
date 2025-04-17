import { DBUsersInterests } from '../../db/interfaces/interface.db-users-interests.js';
import { UpdateUsersInterestsDto } from '../dto/dto.update-users-interests.js';

export function mapUpdateUsersInterestsDtoToDBUsersInterests(
  dto: UpdateUsersInterestsDto,
): DBUsersInterests {
  return {
    user_id: dto.userId,
    technology: dto.technology ?? false,
    sports: dto.sports ?? false,
    music: dto.music ?? false,
    travel: dto.travel ?? false,
    food: dto.food ?? false,
    movies: dto.movies ?? false,
    books: dto.books ?? false,
    art: dto.art ?? false,
    nature: dto.nature ?? false,
    fitness: dto.fitness ?? false,
  };
}
