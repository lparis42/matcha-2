import { verifyDate, verifyEmail, verifyGender, verifyInterests, verifyLength, verifyName, verifyPassword, verifyPictures, verifySexualPreferences } from '../../decorator/decorator.dto.js';
import { Gender, Interests, Pictures, SexualPreferences } from '../interfaces/interface.users.js';

export class UserProfileDto {

    @verifyEmail()
    email?: string;

    @verifyName()
    first_name?: string;

    @verifyName()
    last_name?: string;

    @verifyPassword()
    password?: string;

    @verifyDate()
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

