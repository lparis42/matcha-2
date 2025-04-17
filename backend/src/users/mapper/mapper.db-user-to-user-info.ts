import { DBUser } from "../../db/interfaces/interface.db-user.js";
import { Gender } from "../enum/enum.gender.js";
import { SexualPreference } from "../enum/enum.sexual-preference.js";
import { UserInfo } from "../interfaces/interface.user-info.js";

export function mapDBUserToUserInfo(dbUser: DBUser): UserInfo {
    return {
        id: dbUser.id,
        username: dbUser.username,
        email: dbUser.email,
        firstName: dbUser.first_name,
        lastName: dbUser.last_name,
        age: dbUser.age,
        gender: dbUser.gender as Gender,
        sexualPreference: dbUser.sexual_preferences as SexualPreference,
        fameRating: dbUser.fame_rating,
        biography: dbUser.biography,
    };
}
