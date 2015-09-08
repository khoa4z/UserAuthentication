
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
						expiration: 1
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