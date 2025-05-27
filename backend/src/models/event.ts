import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '@/config/db';

interface EventAttributes {
    id: number;
    title: string;
    description?: string;
    category: 'Концерт' | 'Лекция' | 'Выставка' | 'Встреча';
    date: Date;
    createdBy?: number;
}

type EventCreationAttributes = Optional<EventAttributes, 'id' | 'description' | 'category' | 'createdBy'>;

class Event extends Model<EventAttributes, EventCreationAttributes> implements EventAttributes {
    public id!: number;
    public title!: string;
    public description?: string;
    public category!: 'Концерт' | 'Лекция' | 'Выставка' | 'Встреча';
    public date!: Date;
    public createdBy?: number;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

Event.init(
    {
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
            allowNull: true,
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
                model: 'Users', // название таблицы, убедитесь, что оно совпадает
                key: 'id',
            },
            allowNull: true,
        },
    },
    {
        sequelize,
        modelName: 'Event',
        tableName: 'Events',
        timestamps: true,
    },
);

export default Event;
