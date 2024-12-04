
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
    },
    availableTimeSlots: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: []
    },
    isHoliday: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    maxAppointments: {
      type: DataTypes.INTEGER,
      defaultValue: 1
    }
  });

module.exports = WorkingHours;
