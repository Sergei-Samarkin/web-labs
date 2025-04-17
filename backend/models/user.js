const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
 
 const User = sequelize.define('User', {
     id: {
         type: DataTypes.INTEGER,
         autoIncrement: true,
         primaryKey: true,
     },
     name: {
         type: DataTypes.STRING,
         allowNull: false,
     },
     email: {
         type: DataTypes.STRING,
         unique: true,
         allowNull: false,
         validate: {
             isEmail: true,
         },
     },
     createdAt: {
         type: DataTypes.DATE,
         defaultValue: DataTypes.NOW,
     },
 });
 
 module.exports = User;


