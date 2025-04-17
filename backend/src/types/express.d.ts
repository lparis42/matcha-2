import { AuthDataInterface } from '../auth/interfaces/interface.auth-data.ts';

declare global {
    namespace Express {
        interface Request {
            user?: AuthDataInterface;
        }
    }
}