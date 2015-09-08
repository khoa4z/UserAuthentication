/**
 * Created by Ken on 07/09/2015.
 */

var MongoClient = require('mongodb').MongoClient;
var dburl = { "url" : ["mongodb://123:456@ds059692.mongolab.com:59692/google"] };

var db, _accountCollection;


module.exports.init = function(callback){
    MongoClient.connect( dburl.url[0], function(err, database) {
        if(err){
            console.log(err);
            throw err;
        }
        db = database;
        _accountCollection = db.collection('accs');
        module.exports.accountCollection = _accountCollection;
        callback(err);
    });
}

var name = 'foobar';
module.exports.name = name;