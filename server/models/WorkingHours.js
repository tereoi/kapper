const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const WorkingHours = sequelize.define('WorkingHours', {
    date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    startTime: {
        type: DataTypes.STRING,
        allowNull: false
    },
    endTime: {
        type: DataTypes.STRING,
        allowNull: false
    }
});

module.exports = WorkingHours;