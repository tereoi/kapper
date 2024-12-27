// middleware/security.js
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const compression = require('compression');

const setupMiddleware = (app) => {
  // Security headers
  app.use(helmet());
  
  // GZIP compression
  app.use(compression());
  
  // Rate limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
  });
  
  app.use('/api/', limiter);
};

module.exports = setupMiddleware;