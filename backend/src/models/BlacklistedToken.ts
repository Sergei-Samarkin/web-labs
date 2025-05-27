import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '@/config/db';

// Определяем интерфейс атрибутов модели
interface BlacklistedTokenAttributes {
    id: number;
    token: string;
    expiresAt: Date;
}

// Для создания нового экземпляра, указываем, какие поля необязательны
type BlacklistedTokenCreationAttributes = Optional<BlacklistedTokenAttributes, 'id'>;

// Расширяем Model с указанием типов для атрибутов и данных при создании
class BlacklistedToken
    extends Model<BlacklistedTokenAttributes, BlacklistedTokenCreationAttributes>
    implements BlacklistedTokenAttributes
{
    public id!: number;
    public token!: string;
    public expiresAt!: Date;

    // timestamps, если есть
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

// Инициализация модели
BlacklistedToken.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        token: {
            type: DataTypes.TEXT,
            allowNull: false,
            unique: true,
        },
        expiresAt: {
            type: DataTypes.DATE,
            allowNull: false,
        },
    },
    {
        sequelize,
        modelName: 'BlacklistedToken',
        tableName: 'BlacklistedTokens',
        timestamps: true,
    },
);

export default BlacklistedToken;
