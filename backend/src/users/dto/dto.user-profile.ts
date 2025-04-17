import { verifyDate, verifyEmail, verifyGender, verifyInterests, verifyLength, verifyName, verifyPassword, verifyPictures, verifySexualPreferences } from '../../decorator/decorator.dto.js';
import { Gender, Interests, Pictures, SexualPreferences } from '../interfaces/interface.users.js';

export class UserProfileDto {

    @verifyEmail()
    @verifyLength(6, 255)
    email!: string;

    @verifyPassword()
    @verifyLength(8, 64)
    password!: string;

    @verifyName()
    @verifyLength(3, 20)
    first_name!: string;

    @verifyName()
    @verifyLength(3, 20)
    last_name!: string;

    @verifyDate()
    @verifyLength(10, 10)
    date_of_birth?: string;

    @verifyGender()
    gender?: Gender;

    @verifySexualPreferences()
    sexual_preferences?: SexualPreferences;

    @verifyLength(0, 255)
    biography?: string;

    @verifyInterests()
    interests?: Interests;

    @verifyPictures()
    pictures?: Pictures;
}

