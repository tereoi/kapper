const { Sequelize } = require('sequelize');

let sequelize;

// Check environment and configure database accordingly
if (process.env.NODE_ENV === 'production') {
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false // Dit is nodig voor Render
      }
    },
    logging: false // Optional: disable logging in production
  });
} else {
  // Local development configuration
  sequelize = new Sequelize('postgres://postgres:@Doortje3@localhost:5432/hairdresser', {
    dialect: 'postgres',
    logging: console.log
  });
}

async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
}

testConnection();

module.exports = sequelize;