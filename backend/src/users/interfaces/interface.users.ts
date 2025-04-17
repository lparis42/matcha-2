export interface UserProfile {
    id?: number;
    username?: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    dateOfBirth?: Date;
    gender?: Gender;
    sexualPreferences?: SexualPreferences;
    fameRating?: number;
    biography?: string;
    interests?: Interests;
    pictures?: Pictures;
}

export const GENDERS = [
    'Male',
    'Female',
    'Non-Binary',
    'Other',
] as const;
export interface Gender {
    Gender: typeof GENDERS[number];
}

export const SEXUAL_PREFERENCES = [
    'Heterosexual',
    'Bisexual',
    'Homosexual',
    'Other',
] as const;
export interface SexualPreferences {
    SexualPreference: typeof SEXUAL_PREFERENCES[number];
}

export const INTEREST_KEYS = [
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
] as const;
export type Interests = {
    [K in typeof INTEREST_KEYS[number]]: boolean;
};

export const PICTURES_KEYS = [
    'picture_1',
    'picture_2',
    'picture_3',
    'picture_4',
    'picture_5',
] as const;
export type Pictures = {
    [K in typeof PICTURES_KEYS[number]]: string;
};