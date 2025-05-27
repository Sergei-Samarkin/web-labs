import { User as UserModel } from '../../models/user';

declare global {
    namespace Express {
        // Extend the User interface to include the id property
        interface User extends Partial<UserModel> {
            id?: number;
        }

        interface Request {
            user?: User;
        }
    }
}

export {};
