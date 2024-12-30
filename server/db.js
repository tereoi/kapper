// db.js
const { Sequelize } = require('sequelize');

let sequelize;

function initializeDatabase() {
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.error('DATABASE_URL is not defined in environment variables');
    throw new Error('Database URL not configured');
  }

  try {
    sequelize = new Sequelize(databaseUrl, {
      dialect: 'postgres',
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false
        }
      },
      logging: false,
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
      }
    });
    
    return sequelize;
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
}

module.exports = initializeDatabase();