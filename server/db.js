// db.js
const { Sequelize } = require('sequelize');

// Configure Sequelize with error handling
const initializeDatabase = () => {
  const databaseUrl = process.env.NODE_ENV === 'production' 
    ? process.env.DATABASE_URL
    : process.env.LOCAL_DATABASE_URL;

  if (!databaseUrl) {
    console.error('Database URL not found in environment variables');
    process.exit(1);
  }

  const sequelize = new Sequelize(databaseUrl, {
    dialect: 'postgres',
    dialectOptions: {
      ssl: process.env.NODE_ENV === 'production' ? {
        require: true,
        rejectUnauthorized: false
      } : false
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    logging: process.env.NODE_ENV === 'production' ? false : console.log
  });

  // Test the connection
  sequelize
    .authenticate()
    .then(() => {
      console.log('Database connection established successfully');
    })
    .catch(err => {
      console.error('Unable to connect to the database:', err);
      process.exit(1);
    });

  return sequelize;
};

module.exports = initializeDatabase();