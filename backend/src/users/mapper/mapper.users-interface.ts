import { UsersTableInterface } from "../../db/interfaces/interface.users-table.js";
import { UserProfile } from "../interfaces/interface.users.js";

export function UsersMapper(usersTable: UsersTableInterface): UserProfile {
    return {
        id: usersTable.id,
        username: usersTable.username,
        email: usersTable.email,
        firstName: usersTable.first_name,
        lastName: usersTable.last_name,
        dateOfBirth: usersTable.date_of_birth,
        gender: usersTable.gender,
        sexualPreferences: usersTable.sexual_preferences,
        fameRating: usersTable.fame_rating,
        biography: usersTable.biography,
    };
}
