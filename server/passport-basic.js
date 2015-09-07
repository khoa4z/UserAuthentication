/**
 * Created by prasanthv on 18/11/14.
 */
'use strict';

var passport = require('passport');
var BasicStrategy = require('passport-http').BasicStrategy;
var User = require('../users/userModel');

passport.use(new BasicStrategy(
    function (userid, password, done) {
        console.log('');
        //User.findOne({userName: userid}, function (err, user) {
        //    if (err) {
        //        return done(err);
        //    }
        //    if (!user) {
        //        return done(null, false);
        //    }
        //    if (!user.verifyPassword(password)) {
        //        return done(null, false);
        //    }
        //    return done(null, user);
        //});
    }
));

exports.isAuthenticated = passport.authenticate('basic', {session: false});
