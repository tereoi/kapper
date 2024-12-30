const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  // host: process.env.DB_HOST,
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