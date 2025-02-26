import session from 'express-session';

const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET || 'iugihlkgkgv.kkgut6u7t78',
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    expires:new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    // maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  }
});
export default sessionMiddleware;