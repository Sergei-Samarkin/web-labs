import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

// Load environment variables from the backend/.env file
dotenv.config();

interface EnvVariables {
    DB_NAME: string;
    DB_USER: string;
    DB_PASSWORD: string;
    DB_HOST: string;
}

const env: EnvVariables = {
    DB_NAME: process.env.DB_NAME || '',
    DB_USER: process.env.DB_USER || '',
    DB_PASSWORD: process.env.DB_PASSWORD || '',
    DB_HOST: process.env.DB_HOST || '',
};

const sequelize = new Sequelize(env.DB_NAME, env.DB_USER, env.DB_PASSWORD, {
    host: env.DB_HOST,
    dialect: 'postgres',
});

const authenticateDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('Соединение с БД установлено');
    } catch (error) {
        console.error('Не удалось подключится к БД:', error);
    }
};

authenticateDB();

export { sequelize, authenticateDB };
