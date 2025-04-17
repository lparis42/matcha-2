export interface DBUser {
    id: number;
    email: string;
    username: string;
    fortytwo_id?: string;
    first_name: string;
    last_name: string;
    password?: string;
    age: number;
    gender: string;
    sexual_preferences: string;
    fame_rating: number;
    biography?: string;
    uuid?: string;
    is_verified: boolean;
    created_at: string;
}