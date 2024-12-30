// db.js
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.NODE_ENV === 'production' 
    ? process.env.DATABASE_URL
    : 'postgres://postgres:@Doortje3@localhost:5432/hairdresser',
  {
    dialect: 'postgres',
    dialectOptions: process.env.NODE_ENV === 'production' ? {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    } : {},
    logging: false
  }
);

module.exports = sequelize;