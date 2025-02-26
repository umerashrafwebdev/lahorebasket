import crypto from 'crypto';

const guestMiddleware = (req, res, next) => {
  if (!req.session.guestId) {
    req.session.guestId = crypto.randomUUID(); // Generate new guest ID
    req.session.save(() => { // Save session explicitly
      next();
    });
  } else {
    next();
  }
};
export default guestMiddleware;