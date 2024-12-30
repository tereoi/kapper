// middleware/auth.js
const protectAdminRoute = async (req, res, next) => {
    if (!req.session.isAdmin) {
      return res.status(401).json({ 
        success: false, 
        message: 'Unauthorized' 
      });
    }
    next();
  };
  
  module.exports = { protectAdminRoute };