
var MongoClient = require('mongodb').MongoClient,
	bcrypt   = require('bcrypt-nodejs'),
	nodemailer = require('nodemailer'),
	ObjectID = require('mongodb').ObjectID,
	Q = require('q');

var dburl = { "url" : ["mongodb://123:456@ds059692.mongolab.com:59692/google"] };
var jwt = require('jsonwebtoken');

var secret = "IamQ";
//var db, accountCollection;
//
//MongoClient.connect( dburl.url[0], function(err, database) {
//	if(err){
//		console.log(err);
//		throw err;
//	}
//	db = database;
//	accountCollection = db.collection('accs');
//});

var mongo = require('./mongo.js');

exports.authenticate = function(req, res) {
	//console.log(req.body);
	var _a = req.body;
	mongo.accountCollection.findOne({ email:_a.email  }, function(err, doc){
		if (err || !doc) {
			res.status(400).send('failed');
		}
		if(doc){
			if (verifyPassword(_a.password, doc.hashedPassword)) {
				if(doc.auth === true){
					var token = jwt.sign(doc, 'IamQ', {expiresInMinutes: 60*72});
					console.log('DEBUG: Generated token');

					var _u = {
						_id     : doc._id,
						userName: doc.userName,
						email   : doc.email,
						iat     : doc.iat,
						exp     : doc.exp,
						expiration: 60*72
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
};

exports.emailAuthenticate = function(req, res){
	console.log( req.params.id);
	console.log( req.params.email);
	var email = req.params.email;
	mongo.accountCollection.findAndModify(
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
				res.writeHead(302, {'Location': 'http://localhost:3007/authenticated'});
				res.end();
			}
		});
};

function verifyPassword(password, hashedPassword ){
	return bcrypt.compareSync(password, hashedPassword);
}