const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Appointment = sequelize.define('Appointment', {
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: false
    },
    date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    time: {
        type: DataTypes.STRING,
        allowNull: false
    },
    service: {
        type: DataTypes.STRING,
        allowNull: false
    },
    calendarEventId: { 
        type: DataTypes.STRING,
        allowNull: true
    }
});

module.exports = Appointment;