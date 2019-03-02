var config = require('../config');
// var logger = require('../utils/// logger');
const MongoClient = require('mongodb').MongoClient;
const dbURL = config.MONGODB_URL;
var Promise = require('promise');
var payment = require('./payment');


/* Mongo DB Connection */
var createConnection = (dbName) => {
    var url = dbURL + dbName;
    // logger.writePaymentLog(payment.LOG_ORDER_NUMBER, 'debug','Mongo DB - MongoDB URL ' + url);
    MongoClient.connect(url,{ useNewUrlParser: true }, function(err, db) {
        if (err) {
            // logger.writePaymentLog(payment.LOG_ORDER_NUMBER, 'debug',' MongoDB - Error in Creating Mongo DB Connection');
            throw err;
        } else {
            // logger.writePaymentLog(payment.LOG_ORDER_NUMBER, 'debug','MongoDB - Mongo DataBase Connection Created');
        }
        // db.close();
    });
}
/* Mongo DB Connection */

var createTable = (dbName, tableName) => {
    MongoClient.connect(dbURL,{ useNewUrlParser: true }, function(err, db) {
        if (err) {
            // logger.writePaymentLog(payment.LOG_ORDER_NUMBER, 'debug','MongoDB - Error in Creating Mongo DB Connection');
            throw err;
        } else {
            var dbRef = db.db(dbName);
            // logger.writePaymentLog(payment.LOG_ORDER_NUMBER, 'debug','MongoDB - Mongo DataBase Connection Created');
            dbRef = db.db(dbName);
            dbRef.createCollection(tableName, function(err, res) {
                if (err) {
                    // logger.writePaymentLog(payment.LOG_ORDER_NUMBER, 'debug','MongoDB - Error in Creating Collection ');
                } else {
                    // logger.writePaymentLog(payment.LOG_ORDER_NUMBER, 'debug','MongoDB - Collection with name - ' + tableName +' is created');
                }
                db.close();
            });
        }
    });
}

/* Insert in MongoDB Starts */
var insertOne = (dbName, tableName, payload) => {
    var url = dbURL + dbName;
    // logger.writePaymentLog(payment.LOG_ORDER_NUMBER, 'debug','MongoDB - Insertion in DB - Table - ' + tableName + '- Payload - ' + JSON.stringify(payload));
    return new Promise(function(resolve, reject){
        MongoClient.connect(url, { useNewUrlParser: true }, function(err, db) {
            if (err) {
                // logger.writePaymentLog(payment.LOG_ORDER_NUMBER, 'debug','MongoDB - Error in Connecting DB');
                throw err;
            } else {
                var dbRef = db.db(dbName);
                // logger.writePaymentLog(payment.LOG_ORDER_NUMBER, 'debug','MongoDB - Insert Payload - ' + JSON.stringify(payload));
                dbRef.collection(tableName).insertOne(payload, function(err, res) {
                    if (err) {
                        // logger.writePaymentLog(payment.LOG_ORDER_NUMBER, 'debug','MongoDB - Error in Inserting Documents');
                        // throw err;
                        // reject(err);
                        resolve(res);
                    } else {
                        // logger.writePaymentLog(payment.LOG_ORDER_NUMBER, 'debug','MongoDB - Document Inserted');
                        resolve(res);
                    }
                });
            }
            db.close();
        });
    });
}
/* Insert in MongoDB Ends */


/* Find One in MongoDB Starts */
var findOne = (dbName, tableName, payload) => {
    var url = dbURL + dbName;
    return new Promise(function(resolve, reject){
      MongoClient.connect(url, function(err, db) {
        if(err) {
            // logger.writePaymentLog(payment.LOG_ORDER_NUMBER, 'debug','MongoDB - Error in Connecting DB');
            throw err;
        } else {
            var dbRef = db.db(dbName);
            dbRef.collection(tableName).findOne(payload, function(err, result) {
                if(err) {
                    // logger.writePaymentLog(payment.LOG_ORDER_NUMBER, 'debug','Mongo DB - Error in Fetching Records - ' + err);
                    reject(err);
                } else {
                    // logger.writePaymentLog(payment.LOG_ORDER_NUMBER, 'debug','Mongo DB - Fetching Records Successful - ' + JSON.stringify(result));
                    if(result) {
                        resolve(result);
                    } else {
                        reject(result);
                    }
                    
                }
        });
        }
        db.close();
    });
  });
}
/* Find One in MongoDB Ends */

/* Find Many in MongoDB Starts */
var findMany = (dbName, tableName, query) => {
    var url = dbURL + dbName;
    var retRes = [];
    return new Promise(function(resolve, reject){
      MongoClient.connect(url, function(err, db) {
        if(err) {
            // logger.writePaymentLog(payment.LOG_ORDER_NUMBER, 'debug','MongoDB - Error in Connecting DB');
            throw err;
        } else {
            var dbRef = db.db(dbName);
            dbRef.collection(tableName).find(query).toArray(function(err, result) {
                if(err) {
                    // logger.writePaymentLog(payment.LOG_ORDER_NUMBER, 'debug','Mongo DB - Error in Fetching Records - ' + err);
                    reject(err);
                    db.close();
                } else {
                    // // logger.writePaymentLog(payment.LOG_ORDER_NUMBER, 'debug','Mongo DB - Fetching Records Successful - ' + JSON.stringify(result));
                    resolve(result);
                    db.close();
                }
            });
        }
        
    });
  });
}

/* Find Many in MongoDB Ends */

/* Update in MongoDB Starts */
var updateOne = (dbName, tableName, query, newValues) => {
    var url = dbURL + dbName;
    // logger.writePaymentLog(payment.LOG_ORDER_NUMBER, 'debug','MongoDB - Updation in DB - Table - ' + tableName + '- Query - ' + JSON.stringify(query) + ' - NewValues - ' + JSON.stringify(newValues));
    return new Promise( (resolve, reject) => {
        MongoClient.connect(url, function(err, db) {
            if (err) {
                // logger.writePaymentLog(payment.LOG_ORDER_NUMBER, 'debug','MongoDB - Error in Connecting DB');
                throw err;
            } else {
                    var dbRef = db.db(dbName);
                    var updatePayload = { $set: newValues };
                    // logger.writePaymentLog('debug','Mongo DB - Update - Query - ' +  JSON.stringify(query));
                    // logger.writePaymentLog(payment.LOG_ORDER_NUMBER, 'debug','Mongo DB - Update - newValues - ' + JSON.stringify(newValues));
                    dbRef.collection(tableName).updateOne(query, updatePayload, function( err, result) {
                        if(err) {
                            // logger.writePaymentLog(payment.LOG_ORDER_NUMBER, 'debug','Mongo DB - Error in Updating Record');
                            // throw err;
                            reject(err);
                        } else {
                            // logger.writePaymentLog(payment.LOG_ORDER_NUMBER, 'debug','Mongo DB - Updating Record Successful - ' + JSON.stringify(result));
                            resolve(result);
                    }
                });
                
            }
            db.close();
        });
    });
}
/* Update in MongoDB Ends */

/* Remove from MongoDB Starts */
var removeOne = (dbName, tableName, query) => {
    var url = dbURL + dbName;
    // logger.writePaymentLog(payment.LOG_ORDER_NUMBER, 'debug','MongoDB - Deleting Record - Table - ' + tableName + '- Query - ' + JSON.stringify(query));
    return new Promise(function(resolve, reject) {
        MongoClient.connect(url, function(err, db) {
            if (err) {
                // logger.writePaymentLog(payment.LOG_ORDER_NUMBER, 'debug','MongoDB - Error in Connecting DB');
                throw err;
            } else {
                var dbRef = db.db(dbName);
                dbRef.collection(tableName).deleteOne(query, function(err, result) {
                    if (err) {
                        // logger.writePaymentLog(payment.LOG_ORDER_NUMBER, 'debug','Mongo DB - Error in Deleting Record');
                        // throw err;
                        // reject(err);
                        resolve(err);
                    } else {
                        // logger.writePaymentLog(payment.LOG_ORDER_NUMBER, 'debug','Mongo DB - Deleting Record Successful - ' + JSON.stringify(result));
                        resolve(result);
                    }
                });
            }
            db.close();
        });
    });
}
/* Remove from MongoDB Ends */

module.exports = {
    createConnection: createConnection,
    createTable: createTable,
    insertOne: insertOne,
    findOne: findOne,
    findMany: findMany,
    updateOne: updateOne,
    removeOne: removeOne,
}