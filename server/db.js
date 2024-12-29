const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  dialect: 'postgres',
  dialectOptions: {
    ssl: process.env.NODE_ENV === 'production' 
      ? {
          require: true,
          rejectUnauthorized: false
        }
      : false
  },
  logging: false
});

module.exports = sequelize;