const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();

const sequelize = new  Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        dialect: 'postgres',
    }
)

const authenticateDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('Соединение с БД установлено');
    } catch (error) {
        console.error('Не удалось подключится к БД:', error);
    }
}

authenticateDB();

module.exports = { sequelize, authenticateDB};