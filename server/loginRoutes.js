'use strict';
var //mongoose = require('mongoose'),
    MongoClient = require('mongodb').MongoClient,
    //User = require('../users/userModel'),
    bcrypt   = require('bcrypt-nodejs'),
    nodemailer = require('nodemailer'),
    ObjectID = require('mongodb').ObjectID,

    bodyParser  = require('body-parser'),
    Q = require('q');

var dburl = { "url" : ["mongodb://123:456@ds059692.mongolab.com:59692/google"] };


/*
 Here we are configuring our SMTP Server details.
 STMP is mail server which is responsible for sending and recieving email.
 */

var rand,mailOptions,host,link;
/*------------------SMTP Over-----------------------------*/



var db, accountCollection;

MongoClient.connect( dburl.url[0], function(err, database) {
    if(err){
        console.log(err);
        throw err;
    }
    db = database;
    accountCollection = db.collection('accs');
});


//module.exports = function (router, local, jwt) {
module.exports = function (router, jwt) {


router
    .use(bodyParser.urlencoded({
        extended: true
    }))
    .use(bodyParser.json())
    .use(function (req, res, next){
        next();
    });


router
    .route('/login')
    .get(function(req, res){
        console.log("wrong get");
        res.status(200).send('wrong get')
    })
    .post( function(req,res){
        console.log("*****************************");
        console.log("in Login- Server");
        console.log(req.body);
        var _a = req.body;
        console.log("*****************************");

        accountCollection.findOne({ email:_a.email  }, function(err, doc){
            if (err || !doc) {
                res.status(400).send('failed');
            }
            if(doc){
                console.log(verifyPassword(_a.password, doc.hashedPassword))
                if (verifyPassword(_a.password, doc.hashedPassword)) {

                    if(doc.auth === true){
                        var expires = 1;

                        var token = jwt.sign(doc, 'secret', {expiresInMinutes: expires}); // 60 * 72}); //72 hours
                        console.log('DEBUG: Generated token');

                        var _u = {
                            _id     : doc._id,
                            userName: doc.userName,
                            email   : doc.email,
                            iat     : doc.iat,
                            exp     : doc.exp,
                            expiration: expires
                        };

                        res.send({
                            token: token,
                            user: _u
                        });
                    }
                    else{
                        res.status(400).send('EmailAuthentication');
                    }

                }
                else{
                    res.status(400).send('failed');
                }
            }
        });

//        accountCollection.insert(_a, function(err, data){
//            if(data){
//                console.log("Put to Database");
//                //console.log(data.ops[0]._id); //objectID
//                //@todo: Send Email from here
//                res.status(200).send("Well");
//            }
//            else
//                res.status(400).send("Cannot insert")
//        });

        //res.status(200).send("Well");
    })
;

router
    .route('/login/:id/:email')
    .get(function(req, res){
        console.log('right get');
        console.log( req.params.id);
        console.log( req.params.email);
var email = req.params.email;
        //accountCollection
        //    .findAndModify(
        //    {email:req.params.email}, // query
        //    [],
        //    {$set: { auth: true}}, // replacement, replaces only the field "hi"
        //    {}, // options
        //    function(err, object) {
        //        if (err){
        //            console.warn(err.message);  // returns error if no matching object found
        //            res.status(400).send("not okay");
        //        }else{
        //            console.dir(object);
        //            res.status(200).send("okay");
        //        }
        //    });


        //accountCollection.findAndModify(
        //    { 'email':req.params.email },
        //    { $set: { 'auth': true} },
        //    {
        //        new: true,
        //        upsert: true
        //    }
        //,
        //function(err, doc){
        //    console.log('the id is: '+doc);
        //    console.log(doc);
        //    console.log(err);
        //});

        accountCollection.findAndModify(
            { _id : new ObjectID( req.params.id) },
            [],
            { $set: { 'auth': true} },
            {
                new:true,
                upsert:true,
                w:1
            }, function(err, doc) {
                if (err){
                    res.status(400).send("not okay");
                }else{
                    res.status(200).send("okay");
                }
            });
    });

router.get('/logout', function (req, res) {
    req.logOut();
    res.sendStatus(200);
});

    //@TODO This USER POST should be somewhere else!
    router.route('/user')
        .post(function (req, res) {
            //@TODO Verify the username or email doesn't already exist
            //@TODO Verify body contains required parameters
            //doesUserExist(req.body.username, req.body.email);
            console.log(req.body);
            var _a = {
                userName        :   req.body.userName,
                email           :   req.body.email,
                hashedPassword  :   generateHash(req.body.password1),
                auth            :   false
            }

            accountCollection.findOne({
                    $or: [
                        { email:_a.email },
                        { userName:_a.userName }
                     ]},
                function(err, doc){
                    if (err || !doc) {
                        accountCollection.insert(_a, function(err, data){
                            if(data){
                                console.log("Put to Database");
                                //@todo: Send Email from here
                                res.status(200).send("Well");
                                sendVerificationEmail(data.ops[0]._id, _a.email);
                            }
                            else
                                res.status(400).send("Cannot insert");
                        });

                    }
                    if(doc){
                        if(doc.email == _a.email){
                            res.status(400).send("Same email");
                        }
                        else{
                            res.status(400).send("Same userName");
                        }
                    }
            });
        });

};



function generateHash (_s){
    return bcrypt.hashSync(_s, bcrypt.genSaltSync(10), null);
}

function verifyPassword(password, hashedPassword ){
    return bcrypt.compareSync(password, hashedPassword);
}

function sendVerificationEmail(id,emailTo){
    //host=req.get('host');
    var Link="http://localhost:3007"+"/login/"+id+"/"+emailTo;

    var smtpTransport = nodemailer.createTransport("SMTP",{
        service: "Gmail",
        auth: {
            user: "kentesting23@gmail.com",
            pass: "oneTwo12"
        }
    });

    var mailOptions={
        to : emailTo,
        subject : "Please confirm your Email account",
        html : "Hello,<br> Please Click on the link to verify your email.<br><a href="+Link+">Click here to verify</a>"
    }

    smtpTransport.sendMail(mailOptions, function(error, response){
        if(error){
            console.log(error);
        }else{
            console.log("Message sent: " + response.message);
        }
        smtpTransport.close(); // shut down the connection pool, no more messages
    });
}


