const JWTStrategy = require("passport-jwt").Strategy;
const ExtractJWT = require("passport-jwt").ExtractJwt;
const _ = require("lodash");

const User = require("../models/Users");
const ServiceProvider = require("../models/ServiceProvider");

module.exports = passport => {
  let opt = {};
  opt.jwtFromRequest = ExtractJWT.fromAuthHeaderWithScheme("jwt");
  opt.secretOrKey = process.env.secretKey;
  try {
    passport.use(
      new JWTStrategy(opt, async (jwt_payload, done) => {
        let user = await User.findOne({ _id: jwt_payload.userId }).exec();
        let serviceProvider = await ServiceProvider.findOne({
          _id: jwt_payload.userId
        }).exec();
        if (!_.isEmpty(user)) {
          done(null, user);
        } else if (!_.isEmpty(serviceProvider)) {
          done(null, serviceProvider);
        } else {
          done(null, false);
        }
      })
    );
  } catch (err) {
    throw err;
  }
};
