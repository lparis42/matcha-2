export interface User {
    accessToken: string;
    refreshToken: string;
    profile: {
        id: number;
        username?: string;
        email: string;
        first_name?: string;
        last_name?: string;
        picture?: string;
    };
}