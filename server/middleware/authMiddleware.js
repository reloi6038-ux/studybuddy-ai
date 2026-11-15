const { verifyToken } = require('../services/tokenService');
const User = require('../models/User');

const protect = async (req, res, next) => {
  try {
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer ')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Try real JWT if present
    if (token) {
      try {
        const decoded = verifyToken(token);
        const user = await User.findById(decoded.id).select('-password');
        if (user) {
          req.user = user;
          return next();
        }
      } catch {
        // fall through to guest mode
      }
    }

    // Guest fallback
    const guestId = req.headers['x-guest-id'] || 'guest-' + Date.now();
    const guestEmail = `${guestId}@guest.studybuddy.local`;

    let guest = await User.findOne({ email: guestEmail });
    if (!guest) {
      guest = await User.create({
        name: 'Guest',
        email: guestEmail,
        password: 'guest-' + Math.random().toString(36).slice(2),
        role: 'student',
      });
    }

    req.user = guest;
    res.setHeader('x-guest-id', guestId);
    return next();
  } catch (err) {
    return next(err);
  }
};

module.exports = { protect };