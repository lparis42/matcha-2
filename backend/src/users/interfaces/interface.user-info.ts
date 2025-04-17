import { Gender } from "../enum/enum.gender.js";
import { Interest } from "../enum/enum.interest.js";
import { SexualPreference } from "../enum/enum.sexual-preference.js";

export interface UserInfo {
    id?: number;
    username?: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    picture?: string;
    age?: number;
    gender?: Gender;
    sexualPreference?: SexualPreference;
    fameRating?: number;
    biography?: string;
    interests?: Interest[];
}