import { UserData } from '../interfaces/interface.userdata.ts';

declare global {
    namespace Express {
        interface Request {
            user?: UserData;
        }
    }
}