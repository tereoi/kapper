// server/monitoring/performance.js
const { performance, PerformanceObserver } = require('perf_hooks');
const winston = require('winston');

// Logger setup
const logger = winston.createLogger({
 level: 'info',
 format: winston.format.combine(
   winston.format.timestamp(),
   winston.format.json()
 ),
 transports: [
   new winston.transports.File({ filename: 'performance.log' })
 ]
});

// Performance observer
const obs = new PerformanceObserver((list) => {
 const entries = list.getEntries();
 entries.forEach((entry) => {
   logger.info({
     name: entry.name,
     duration: entry.duration,
     timestamp: entry.timestamp
   });
 });
});

obs.observe({ entryTypes: ['measure'], buffered: true });

// Monitoring middleware
const performanceMiddleware = (req, res, next) => {
 const start = performance.now();
 res.on('finish', () => {
   const duration = performance.now() - start;
   performance.mark(`${req.method}-${req.path}-start`);
   performance.mark(`${req.method}-${req.path}-end`);
   performance.measure(
     `${req.method} ${req.path}`,
     `${req.method}-${req.path}-start`,
     `${req.method}-${req.path}-end`
   );
   logger.info({
     method: req.method,
     path: req.path,
     duration: duration,
     status: res.statusCode
   });
 });
 next();
};

const setupMonitoring = (app) => {
 app.use(performanceMiddleware);
 
 // Monitor database queries
 app.on('database-query', (queryTime) => {
   logger.info({
     type: 'database-query',
     duration: queryTime
   });
 });
 
 // Monitor memory usage
 setInterval(() => {
   const memoryUsage = process.memoryUsage();
   logger.info({
     type: 'memory-usage',
     heapUsed: memoryUsage.heapUsed,
     heapTotal: memoryUsage.heapTotal,
     rss: memoryUsage.rss
   });
 }, 300000); // Every 5 minutes
};

module.exports = { setupMonitoring };