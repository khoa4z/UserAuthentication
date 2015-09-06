'use strict';
var //mongoose = require('mongoose'),
    MongoClient = require('mongodb').MongoClient,
    //User = require('../users/userModel'),
    bcrypt   = require('bcrypt-nodejs'),
    Q = require('q');

var dburl = { "url" : ["mongodb://123:456@ds059692.mongolab.com:59692/google"] };

var db, accountCollection, eventCollection;

MongoClient.connect( dburl.url[0], function(err, database) {
    if(err){
        console.log(err);
        throw err;
    }
    db = database;
    accountCollection = db.collection('accs');
});


module.exports = function (router, local, jwt) {

router.route('/login')
    .post( function(req,res){
        console.log("*****************************");
        console.log("in Login- Server");
        console.log(req.body);
        var _a = req.body;
        console.log("*****************************");

        accountCollection.findOne({ email:_a.email  }, function(err, doc){
            if (err) {
                res.status(400).send('failed');
            }
            if(doc){
                console.log(verifyPassword(_a.password, doc.hashedPassword))
                if (verifyPassword(_a.password, doc.hashedPassword)) {

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

            accountCollection.insert(_a, function(err, data){
                if(data){
                    console.log("Put to Database");
                    //console.log(data.ops[0]._id); //objectID
                    //@todo: Send Email from here
                    res.status(200).send("Well");
                }
                else
                    res.status(400).send("Cannot insert")
            });

//            var tasks = [];
//            var user = new User();
//            user.userName = req.body.userName;
//            user.email = req.body.email;
//            console.log("This is the password: "+ req.body.password1);
//            user.hashedPassword = user.generateHash(req.body.password1);
//            user.firstName = req.body.firstName;
//            user.lastName = req.body.lastName;
//            user.auth = false;

//            Q.all(tasks)
//                .then(function (results) {
//                    user.save(function (err) {
//                        if (err) {
//                            res.status(417).send(err);
//                            console.log(err);
//                        }
//                        else {
//                            console.log('User is well created!');
//                            res.send({message: 'User Created'});
//                        }
//                    });
//                }, function (err) {
//                    console.log(err);
//                    res.status(417).send(err);
//                });
        });
};

function generateHash (_s){
    return bcrypt.hashSync(_s, bcrypt.genSaltSync(10), null);
}

function verifyPassword(password, hashedPassword ){
    return bcrypt.compareSync(password, hashedPassword);
};