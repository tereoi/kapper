// db.js
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DATABASE_URL,
  {
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    logging: false
  }
);

// Add connection retry logic
const connectWithRetry = async () => {
  let retries = 5;
  while (retries > 0) {
    try {
      await sequelize.authenticate();
      console.log('Database connected successfully');
      return;
    } catch (err) {
      console.log(`Database connection attempt failed. Retries left: ${retries}`);
      retries--;
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
  throw new Error('Unable to connect to database after retries');
};

sequelize.connectWithRetry = connectWithRetry;
module.exports = sequelize;