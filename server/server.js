/**
 * Created by Ken on 06/09/2015.
 */
var express = require('express');
var routes = require('./routes');
var path = require('path');

//var favicon = require('serve-favicon');
var logger = require('morgan');
var methodOverride = require('method-override');
var session = require('express-session');
var cookieParser		= require('cookie-parser');
var bodyParser = require('body-parser');
//var multer = require('multer');
var errorHandler = require('errorhandler');
var log		= require('winston').loggers.get('app:server');
var expressValidator 	= require('express-validator');

//var cors = require('cors');

var expressJwt = require('express-jwt');
var security = require('./routes/security');
var secured = require('./routes/secured');
var user = require('./routes/user');

var app = express();
var mongo = require('./routes/mongo');

var config  = {
    "port"  : 3007,
    "ip"    : "127.0.0.1"
};

//app.use(logger('dev'));
app.use(bodyParser.urlencoded({extended: true})).use(bodyParser.json());
app.use(methodOverride());
app.use(cookieParser());
app.use(expressValidator());

//set up session
app.use(session({ resave: true,
    saveUninitialized: true,
    secret: 'IamQ'
}));

//Set up environment
app.use(express.static(path.join(__dirname + '/../')));
app.use(express.static('../public/..'));
app.use(express.static(path.join(__dirname + '/../public/'))); // static serving all files in public

var options = { redirect: false };
//app.use(cors()); //providing a Connect/Express middleware that can be used to enable CORS with various options.
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
    app.use(errorHandler());
}

//app.get('/', routes.index);
// Authorize API endpoints using JWT tokens
app.use('/api/v1/', expressJwt({secret: 'IamQ'}), function(req, res, next){
    console.log('Authenticating');
    next();
});


//app.options('*', cors());
app.post('/login', security.authenticate);
app.get('/login/:id/:email', security.emailAuthenticate);
app.post('/user', user.createUser);

app.get('/api/v1/mission/:id', function(req, res){
   console.log("inside get");
    res.send('200');
});


app.get('*', function (req, res) {
    //@todo: check session from here
    res.sendFile(path.join('/public/main.html'), {"root": "../"});
});




mongo.init(function(error){
    if(error)
        throw error;

    app.listen(config.port, config.ip, function (err) {
        if (err) {
            log.error('Unable to listen for connections', err);
            process.exit(10);
        }
        log.info('Magic happens in http://' +  config.ip + ':' + config.port);
    });
});