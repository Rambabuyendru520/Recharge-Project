var mongoose = require('mongoose');
var config = require('./config');

mongoose.connect(config.DB.url, config.DB.connectionOptions);
var db = mongoose.connection;

db.on('error', function(err) {
	console.log("Error in database - " + err);
});

db.once('open', function() {
	console.log('Connected to database');
});

exports.connection = db;
