// server/models/Admin.js
const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Admin = sequelize.define('Admin', {
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      index: true
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    indexes: [
      { fields: ['username'] }
    ]
  });

module.exports = Admin;