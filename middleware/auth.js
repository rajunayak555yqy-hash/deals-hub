const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  // Check session or JWT token
  const token = req.session?.adminToken || req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    if (req.xhr || req.path.startsWith('/api/')) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    return res.redirect('/admin/login');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (err) {
    if (req.xhr || req.path.startsWith('/api/')) {
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }
    return res.redirect('/admin/login');
  }
};

module.exports = authMiddleware;