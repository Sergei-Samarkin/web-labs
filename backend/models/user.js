const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const bcrypt = require('bcryptjs');
 
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
     password: {
       type: DataTypes.STRING,
       allowNull: false,
     },
     createdAt: {
         type: DataTypes.DATE,
         defaultValue: DataTypes.NOW,
     },
 });

 User.beforeCreate(async (user) => {
    user.password = await bcrypt.hash(user.password, 10);
  });
 
 module.exports = User;


