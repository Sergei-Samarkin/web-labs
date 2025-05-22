const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const BlacklistedToken = sequelize.define('BlacklistedToken', {
  token: {
    type: DataTypes.TEXT,
    allowNull: false,
    unique: true,
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false,
  },
});

module.exports = BlacklistedToken;