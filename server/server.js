const { Sequelize } = require('sequelize');

let sequelize;

if (process.env.NODE_ENV === 'production') {
  // Log de database URL (verberg gevoelige info)
  const dbUrl = process.env.DATABASE_URL || 'No DATABASE_URL set';
  console.log('Database URL format:', dbUrl.split('@')[1]); // Log alleen het host deel
  
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
    retry: {
      max: 5,
      backoffBase: 5000,
      backoffExponent: 1.1,
    },
    logging: false
  });
} else {
  sequelize = new Sequelize('postgres://postgres:@Doortje3@localhost:5432/hairdresser', {
    dialect: 'postgres',
    logging: console.log
  });
}

// Verbeterde connectie test
const testConnection = async () => {
  let retries = 5;
  while (retries) {
    try {
      await sequelize.authenticate();
      console.log('Database connection has been established successfully.');
      return true;
    } catch (err) {
      console.error('Unable to connect to the database:', {
        message: err.message,
        code: err.original?.code,
        errno: err.original?.errno
      });
      retries -= 1;
      if (retries === 0) return false;
      console.log(`Retrying connection... ${retries} attempts left`);
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
  return false;
};

// Test de connectie bij startup
testConnection()
  .then(success => {
    if (!success) {
      console.error('Failed to establish database connection after retries');
      process.exit(1);
    }
  });

module.exports = sequelize;