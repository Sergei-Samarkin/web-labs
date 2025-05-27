import { Model } from 'sequelize';

// Define a minimal user interface
export interface IUser extends Model {
    id: number;
    email: string;
    name: string;
    // Add other user properties as needed
}

declare global {
    namespace Express {
        // Extend Express's User interface
        interface User extends IUser {}

        // Extend Express's Request interface
        interface Request {
            user?: User;
        }
    }
}

export {};
