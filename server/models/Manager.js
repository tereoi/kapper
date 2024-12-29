// models/Manager.js
const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Manager = sequelize.define('Manager', {
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    timestamps: true
});

module.exports = Manager;