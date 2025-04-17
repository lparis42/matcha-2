export interface UsersInterface {
    id?: number;
    username?: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    dateOfBirth?: Date;
    gender?: GenderInterface;
    sexualPreferences?: SexualPreferencesInterface;
    fameRating?: number;
    biography?: string;
    interests?: InterestInterface;
    pictures?: string[];
}

export interface GenderInterface {
    Gender: 'Male' | 'Female' | 'Non-Binary' | 'Other';
}

export interface SexualPreferencesInterface {
    SexualPreference: 'Heterosexual' | 'Bisexual' | 'Homosexual' | 'Pansexual' | 'Asexual' | 'Queer' | 'Other';
}

export interface InterestInterface {
    Technology: boolean;
    Sports: boolean;
    Music: boolean;
    Travel: boolean;
    Food: boolean;
    Movies: boolean;
    Books: boolean;
    Art: boolean;
    Nature: boolean;
    Fitness: boolean;
}