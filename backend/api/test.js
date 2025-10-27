// Simple test endpoint
module.exports = (req, res) => {
  res.status(200).json({ message: 'Backend is working!', timestamp: new Date().toISOString() });
};

