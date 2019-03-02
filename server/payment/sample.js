const config = require('../config');
const mydb = require('./mydb');
var dbName = config.PAYMENT.DB_NAME;
var promiseCloseTable = config.PAYMENT.PROMISE_CLOSE_TABLE;

var findPayload = {"STATUS": "SUCCESS"};
var total = 0;
mydb.findMany(dbName, promiseCloseTable, findPayload).then(fresult => {
    console.log('Length - ' + fresult.length);
    for(var i=0 ;i< fresult.length;i++){
        total += parseInt(fresult[i].AMOUNT, 0);
    }
    console.log('Total - ' + total);
}).catch(err => {
    console.log(err);
})