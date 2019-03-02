const MongoClient = require('mongodb').MongoClient;
const config = require('../config');
const dbURL = config.MONGODB_URL;
exports.createConnection = (dbName) => {
    var url = dbURL + dbName;
    console.log('Mongo DB - MongoDB URL ' + url);
    MongoClient.connect(url,{ useNewUrlParser: true }, function(err, db) {
        if (err) {
            console.log(' MongoDB - Error in Creating Mongo DB Connection');
            throw err;
        } else {
            console.log('MongoDB - Mongo DataBase Connection Created');
        }
        // db.close();
    });
}

exports.createTable = (dbName, tableName) => {
    MongoClient.connect(dbURL,{ useNewUrlParser: true }, function(err, db) {
        if (err) {
            console.log('MongoDB - Error in Creating Mongo DB Connection');
            throw err;
        } else {
            var dbRef = db.db(dbName);
            console.log('MongoDB - Mongo DataBase Connection Created');
            dbRef = db.db(dbName);
            dbRef.createCollection(tableName, function(err, res) {
                if (err) {
                    console.log('MongoDB - Error in Creating Collection ');
                } else {
                    console.log('MongoDB - Collection with name ' + tableName +' is created');
                }
                // db.close();
            });
        }
       
    });
}

exports.insertOne = (dbName, tableName, payload) => {
    var url = dbURL + dbName;
    MongoClient.connect(url, { useNewUrlParser: true }, function(err, db) {
        if (err) {
            console.log('MongoDB - Error in Connecting DB');
            throw err;
        } else {
            var dbRef = db.db(dbName);
            dbRef.collection(tableName).insertOne(payload, function(err, res) {
                if (err) {
                    console.log('MongoDB - Error in Inserting Documents');
                    throw err;
                } else {
                    console.log('MongoDB - Document Inserted');
                }
            })
        }
        // db.close();
    })
}

exports.find = (dbName, tableName, payload) => {
    var url = dbURL + dbName;
    MongoClient.connect(url, function(err, db) {
        if(err) {
            console.log('MongoDB - Error in Connecting DB');
            throw err;
        } else {
            var dbRef = db.db(dbName);
            dbRef.collection(tableName).find(payload).toArray(function(err, result) {
                if(err) {
                    console.log('Mongo DB - Error in Fetching Records');
                    throw err;
                } else {
                    console.log('Mongo DB - Fetching Records Successful', JSON.stringify(result));
                    return result;
                }
            })
        }
        // db.close();
    });
}

exports.updateOne = (dbName, tableName, query, newValues) => {
    var url = dbURL + dbName;
    MongoClient.connect(url, function(err, db) {
        if (err) {
            console.log('MongoDB - Error in Connecting DB');
            throw err;
        } else {
            var dbRef = db.db(dbName);
            var result = dbRef.collection(tableName).updateOne(query, newValues, function( err, result) {
                if(err) {
                    console.log('Mongo DB - Error in Updating Record');
                    throw err;
                } else {
                    console.log('Mongo DB - Updating Record Successful', JSON.stringify(result));
                    return result;
                }
            });
        }
        // db.close();
        console.log('CCCCCCCCCCCCCCCCCC', result);
        return result;
    });
}

exports.removeOne = (dbName, tableName, query) => {
    var url = dbURL + dbName;
    MongoClient.connect(url, function(err, db) {
        if (err) {
            console.log('MongoDB - Error in Connecting DB');
            throw err;
        } else {
            var dbRef = db.db(dbName);
            dbRef.collection(tableName).deleteOne(query, function(err, result) {
                if (err) {
                    console.log('Mongo DB - Error in Deleting Record');
                    throw err;
                } else {
                    console.log('Mongo Db - Deleting Record Successful', JSOn.stringify(result));
                }
            });
        }
        // db.close();
    });
}