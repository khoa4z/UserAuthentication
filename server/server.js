'use strict';

var express = require('express'),
    path    = require('path'),
    log		= require('winston').loggers.get('app:server'),
    passport= require('passport'),
    app     = express();

var cookieParser		= require('cookie-parser');
var bodyParser     		= require('body-parser');
var session				= require('express-session');
var methodOverride 		= require('method-override');
var expressValidator 	= require('express-validator');
var expressJwt			= require('express-jwt');
var jwt					= require('jsonwebtoken');

var config  = {
    "port"  : 3007,
    "ip"    : "127.0.0.1"
};

// Configure passport, i.e. create login stratagies
require('./passport-local')(passport);

app.use(express.static(path.join(__dirname + '/../')));
app.use(express.static('../public/..'));
app.use(express.static(path.join(__dirname + '/../public/'))); // static serving all files in public


app.use(cookieParser());
app.use(expressValidator());
app.use(bodyParser.urlencoded({extended: true})).use(bodyParser.json());
app.use(methodOverride());
//app.use(flash()); // use connect-flash for flash messages stored in session

/*set-up for passport*/
app.use(session({secret: 'iamalibrary', saveUninitialized: true, resave: true}));
app.use(passport.initialize());
app.use(passport.session());

var local = passport.authenticate('local');
//console.log(local);

//@todo: Recheck this
var router = express.Router();
var loginRouter = express.Router();
require('./loginRoutes')(loginRouter, local, jwt);

app.use(loginRouter);

// Authorize API endpoints using JWT tokens
app.use('/api/v1/', expressJwt({secret: 'secret'}), function(req, res, next){
    console.log('Authenticating');
    next();
});

//require('./users/userRoutes')(router);
//require('./testModel/testRoutes')(router);
app.use('/api/v1/', router);

app.get('*', function (req, res) {
    res.sendFile(path.join('/public/main.html'), {"root": "../"});
});




app.listen(config.port, config.ip, function (err) {
    if (err) {
        log.error('Unable to listen for connections', err);
        process.exit(10);
    }
    log.info('Magic happens in http://' +  config.ip + ':' + config.port);
    //console.log('(\\(\\');
    //console.log("(=':')");
    //console.log('(,(")(")');
});