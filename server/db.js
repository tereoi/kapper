const { Sequelize } = require('sequelize');

let sequelize;

const connectWithRetry = async () => {
  let retries = 5;
  
  while (retries) {
    try {
      if (process.env.NODE_ENV === 'production') {
        sequelize = new Sequelize(process.env.DATABASE_URL, {
          dialect: 'postgres',
          dialectOptions: {
            ssl: {
              require: true,
              rejectUnauthorized: false
            },
            keepAlive: true,
          },
          pool: {
            max: 5,
            min: 0,
            acquire: 60000,
            idle: 10000
          },
          logging: false
        });
      } else {
        sequelize = new Sequelize('postgres://postgres:@Doortje3@localhost:5432/hairdresser', {
          dialect: 'postgres',
          logging: console.log
        });
      }

      await sequelize.authenticate();
      console.log('Database connection established successfully.');
      return sequelize;
    } catch (error) {
      retries -= 1;
      console.log(`Database connection failed. Retries left: ${retries}`);
      console.error('Connection error:', error);
      
      if (retries === 0) {
        throw new Error('Unable to connect to the database after multiple attempts');
      }
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
};

// Direct export van sequelize instantie
module.exports = new Sequelize(
  process.env.NODE_ENV === 'production'
    ? process.env.DATABASE_URL
    : 'postgres://postgres:@Doortje3@localhost:5432/hairdresser',
  {
    dialect: 'postgres',
    dialectOptions: process.env.NODE_ENV === 'production' 
      ? {
          ssl: {
            require: true,
            rejectUnauthorized: false
          }
        }
      : {},
    logging: process.env.NODE_ENV === 'production' ? false : console.log
  }
);