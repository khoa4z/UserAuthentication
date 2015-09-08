/*
 * GET users listing.
 */
var nodemailer = require('nodemailer');
var MongoClient = require('mongodb').MongoClient,
	bcrypt   = require('bcrypt-nodejs'),
	ObjectID = require('mongodb').ObjectID,
	Q = require('q');

var jwt = require('jsonwebtoken');

var secret = "IamQ";

var mongo = require('./mongo.js');

exports.list = function(req, res){
  res.send("respond with a resource");
};

exports.passwordRecovery = function(req, res) {
	var transport = nodemailer.createTransport("SMTP", {
	    host: "happy.lunarbreeze.com", // hostname
	    secureConnection: true, 
	    port: 465, // port for SMTP
	    debug: true,
	    auth: {
	        user: "info@effwww.com",
	        pass: "%[__?Wv!n%lw"
	    }
	});
	
	var mailOptions = {
		    from: "Info <info@effwww.com>", // sender address
		    to: "jliang6@hotmail.com, jliang@effwww.com",
		    subject: "Effwww",
//		    text: "Hello world ✔", // plaintext body
		    html: "<b>Hello world ✔</b>" // html body
	}
	
	// send mail with defined transport object
	transport.sendMail(mailOptions, function(error, response){
	    if(error){
	        console.log(error);
	    }else{
	        console.log("Message sent: " + response.message);
	    }
	    transport.close();
	});
	
	
	res.send('Email sent');
};

exports.createUser = function(req, res) {
	var _a = {
		userName        :   req.body.userName,
		email           :   req.body.email,
		hashedPassword  :   generateHash(req.body.password1),
		auth            :   false
	}

	mongo.accountCollection.findOne({
			$or: [
				{ email:_a.email },
				{ userName:_a.userName }
			]},
		function(err, doc){
			if (err || !doc) {
				mongo.accountCollection.insert(_a, function(err, data){
					if(data){
						console.log("Put to Database");
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
};

function generateHash (_s){
	return bcrypt.hashSync(_s, bcrypt.genSaltSync(10), null);
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


