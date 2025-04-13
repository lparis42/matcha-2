export interface UserData {
    id?: number;
    access_token?: string;
    profile?: {
        fortytwo_id: number;
        username?: string;
        email: string;
        first_name?: string;
        last_name?: string;
        picture?: string;
    };
}