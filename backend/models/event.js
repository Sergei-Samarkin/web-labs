const { DataTypes } = require('sequelize');
const {sequelize } = require('../config/db');

const Event = sequelize.define('Event', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true,
        },
    },
    description: {
        type: DataTypes.TEXT,
    },
    category: {
        type: DataTypes.ENUM('Концерт', 'Лекция', 'Выставка', 'Встреча'),
        defaultValue: 'Встреча',
    },
    date: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    createdBy: {
        type: DataTypes.INTEGER,
        references: {
            model: 'Users',
            key: 'id',
        },
    },
})


module.exports = Event;