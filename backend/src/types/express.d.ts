import { User } from '../interfaces/interface.user.js';

declare global {
    namespace Express {
        interface Request {
            user?: User;
        }
    }
}