import { Gender, SexualPreferences } from "../../users/interfaces/interface.users.js";

export interface UsersTableInterface {
    id: number;
    fortytwo_id?: string;
    email: string;
    username: string;
    first_name: string;
    last_name: string;
    password?: string;
    date_of_birth?: Date;
    gender?: Gender;
    sexual_preferences?: SexualPreferences;
    fame_rating: number;
    biography?: string;
    uuid?: string;
    is_verified: boolean;
    created_at: Date;
}