const passport = require('passport');
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const dotenv = require('dotenv');
const pool = require('./db');

dotenv.config();

const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET,
  expiresIn: '1h',
};

passport.use(
  new JwtStrategy(opts, async (jwtPayload, done) => {
    try {
      const result = await pool.query('SELECT id, email FROM users WHERE id = $1', [jwtPayload.id]);
      const user = result.rows[0];
      if (user) {
        return done(null, user);
      }
      return done(null, false);
    } catch (err) {
      return done(err, false);
    }
  }),
);

module.exports = passport;
