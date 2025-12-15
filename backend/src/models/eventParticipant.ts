import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '@/config/db';
import User from './user';
import Event from './event';

interface EventParticipantAttributes {
    id: number;
    eventId: number;
    userId: number;
    joinedAt?: Date;
}

type EventParticipantCreationAttributes = Optional<EventParticipantAttributes, 'id' | 'joinedAt'>;

class EventParticipant extends Model<EventParticipantAttributes, EventParticipantCreationAttributes> implements EventParticipantAttributes {
    public id!: number;
    public eventId!: number;
    public userId!: number;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;

    // Associations
    public user?: User;
    public event?: Event;
}

EventParticipant.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        eventId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Events',
                key: 'id',
            },
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Users',
                key: 'id',
            },
        },
    },
    {
        sequelize,
        modelName: 'EventParticipant',
        tableName: 'EventParticipants',
        timestamps: true,
        indexes: [
            {
                unique: true,
                fields: ['eventId', 'userId'],
            },
        ],
    },
);

export default EventParticipant;
