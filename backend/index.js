// Serverless handler for Vercel
const app = require('./server');

// Export as Vercel serverless function
module.exports = async (req, res) => {
  return app(req, res);
};

