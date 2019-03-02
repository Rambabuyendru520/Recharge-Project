var config = require('../config');
var mydb = require('./mydb');
var request = require('request');
var logger = require('../utils/logger');
var Promise = require('promise');
const utf8 = require('utf8');
var md5 = require('blueimp-md5');

var dbName = config.PAYMENT.DB_NAME;
var paymentOpenTable = config.PAYMENT.PAYMENT_OPEN_TABLE;
var paymentCloseTable = config.PAYMENT.PAYMENT_CLOSE_TABLE;
var eppixOpenTable = config.PAYMENT.PROMISE_OPEN_TABLE;
var mailUserName = config.PAYMENT.MAIL_USERNAME;
var mailPassword = config.PAYMENT.MAIL_PASSWORD;
var mailCC = config.PAYMENT.MAIL_CC;
var appName = config.PAYMENT.APP_NAME;
var LOG_ORDER_NUMBER = '';
var mailSubject = "MyMTN - Payment Transaction";
const maxPaymentRetries = config.PAYMENT.PAYMENT_RETRIES;
const maxRetryPeriod = 15;
const iteration = 0;

var startPaymentTask = function(step, req, res, cdrParams) {
    if (req && req.body && req.body.ORDER_NO) {
        LOG_ORDER_NUMBER = req.body.ORDER_NO;
    }
    if (req && req.body && req.body.order_no) {
        LOG_ORDER_NUMBER = req.body.order_no;
    }
    if (step == 1) {
        checkOpenTransaction(req, res, cdrParams);
    } else if(step == 2) {
        getPaymentStatus(req, res, cdrParams);
    } else if(step == 3) {
        mailToUser(req, res, cdrParams);
    } else if(step == 4) {
        closePayment(req, res, cdrParams);
    } else if(step == 5) {
        promiseOpen(req, res, cdrParams);
    }
}

var checkOpenTransaction = function(req, res, cdrParams) {
    logger.writePaymentTaskLog(LOG_ORDER_NUMBER, 'info', 'Payment Task - Step 1 - Checking Open Transactions - STARTS');
    try{
            var findPayload = { STATUS: 'OPEN' };
            var singleRes;
            var res = '';
            var cdrParams = '';
            mydb.findMany(dbName, paymentOpenTable, findPayload).then(result => {
                // logger.writePaymentTaskLog(LOG_ORDER_NUMBER, 'info', 'Payment Task - Step 1 - Checking Open Transactions - Find Successful from DB - ' + JSON.stringify(result));
                for(var i = 0; i < result.length; i++) {
                    var singleRes = result[i];
                    var nowDate = new Date();
                    console.log('here2 - ' + new Date(singleRes.TRANSACTION_TIME.toString()));
                    var minDiff = millisToMinutesAndSeconds(Math.abs(nowDate.getTime() -  new Date(singleRes.TRANSACTION_TIME.toString()).getTime()));
                    console.log('here3');
                    logger.writePaymentTaskLog('Diff in minutes - ' + minDiff);
                    console.log('Mindiff - ' + minDiff);
                    var req = { body: {} };
                    if (minDiff >= maxRetryPeriod) {
                        LOG_ORDER_NUMBER = singleRes.ORDER_NO;
                        logger.writePaymentTaskLog(LOG_ORDER_NUMBER, 'info', 'Payment Task - Step 1 - Checking Open Transactions - Loop STARTS for ' + (i+1) + ' OUT OF ' + result.length);
                        logger.writePaymentTaskLog(LOG_ORDER_NUMBER, 'info', 'Payment Task - Step 1 - Starting the transaction which has details - ' + JSON.stringify(singleRes));
                        var updateQuery = { PAY_REQUEST_ID :  singleRes.PAY_REQUEST_ID };
                        singleRes.RETRY = singleRes.RETRY + 1;
                        var newRetry = singleRes.RETRY;
                        var updateValues = { RETRY:  newRetry };
                        logger.writePaymentTaskLog(LOG_ORDER_NUMBER, 'info', 'Payment Task - Step 1 - Updating Retries from - ' + (singleRes.RETRY - 1) +' to ' + newRetry);
                        mydb.updateOne(dbName, paymentOpenTable, updateQuery, updateValues);
                            logger.writePaymentTaskLog(LOG_ORDER_NUMBER, 'info', 'Payment Task - Step 1 - Updation Successful');
                            req.body = singleRes;
                            getPaymentStatus(req, res, cdrParams);
                            // logger.writePaymentTaskLog(LOG_ORDER_NUMBER, 'info', 'Payment Task - Step 1 - Checking Open Transactions - Loop ENDS for ' + (i+1) + ' OUT OF ' + result.length);
                        /* }).catch(uerr => {
                            logger.writePaymentTaskLog(LOG_ORDER_NUMBER, 'info', 'Payment Task - Step 1 - Updation Failure - ' + uerr);
                        }); */
                }
            }
        });
        logger.writePaymentTaskLog(LOG_ORDER_NUMBER, 'info', 'Payment Task - Step 1 - Checking Open Transactions - ENDS');
    } catch(error) {
        logger.writePaymentTaskLog(LOG_ORDER_NUMBER, 'info', 'Payment Task - Step 1 - Checking Open Transactions - Error Caught - ' + error.stack);
    }
}

var getPaymentStatus = function(req, res, cdrParams) {
    logger.writePaymentTaskLog(LOG_ORDER_NUMBER, 'debug', 'Payment Task - Step 2 - Get Payment Status from SOA - STARTS - ' + JSON.stringify(req));
    try {
        var checkSumStr = '' + config.PAYMENT.PAYGATE_ID + req.body.PAY_REQUEST_ID + req.body.MSISDN + config.PAYMENT.PAYGATE_KEY + '';
        logger.writePaymentTaskLog(LOG_ORDER_NUMBER, 'debug', 'Payment Task - Step 2 - Get Payment Status from SOA - CheckSum String - ' + checkSumStr);
        const payload = {
            transaction_id: logger.getTransactionID(),
            paygate_id: config.PAYMENT.PAYGATE_ID,
            pay_request_id: req.body.PAY_REQUEST_ID,
            reference: req.body.MSISDN,
            checksum: md5(checkSumStr)
        };
        const options = {
            method: 'POST',
            uri:  config.SOA_URL + "QueryPayGateTransactionService/QueryPayGateTransactionStatus/getPaymentResult",
            json: true,
            headers: {
              "Authorization": "Basic " + config.REST_AUTH_SOA,
              "Accept": "application/json",
              "Content-Type": "application/json",
              "ENV": "SIT1"
            },
            body: payload
          }
          logger.writePaymentTaskLog(LOG_ORDER_NUMBER, 'debug', 'Payment Task - Step 2 - Get Payment Status from SOA - Request URL - ' + JSON.stringify(options.uri));
          logger.writePaymentTaskLog(LOG_ORDER_NUMBER, 'debug', 'Payment Task - Step 2 - Get Payment Status from SOA - Request Payload - ' + JSON.stringify(payload));
          return new Promise (function(resolve, reject) {
              request(options, function(error, response, body) {
                  if (!error && response.statusCode == 200) {
                    if(body.status_code === 0 || body.status_code == 0 || body.status_code === '0' || body.status_code == '0') {
                        logger.writePaymentTaskLog(LOG_ORDER_NUMBER, 'debug', 'Payment Task - Step 2 - Get Payment Status from SOA - Success Response  - ' +  JSON.stringify(body));
                        logger.writePaymentTaskLog(LOG_ORDER_NUMBER, 'debug', 'Payment Task - Step 2 - Get Payment Status from SOA - OUT');
                        req.payment_status = body;
                        startPaymentTask(3, req, res, cdrParams);
                    } else {
                        if(req.body.RETRY >= maxPaymentRetries) {
                            logger.writePaymentTaskLog(LOG_ORDER_NUMBER, 'debug', 'Payment Task - Step 2 - Get Payment Status from SOA - Failure Response  - ' +  JSON.stringify(body));
                            logger.writePaymentTaskLog(LOG_ORDER_NUMBER, 'debug', 'Payment Task - Step 2 - Get Payment Status from SOA - Proceeding to Close Payment as RETRY is more than 3 times - ' + req.body.RETRY);
                            req.payment_status = {};
                            req.payment_status.transaction_status = 'FAIL';
                            startPaymentTask(4, req, res, cdrParams);
                        }
                    }
                  } else {
                    logger.writePaymentTaskLog(LOG_ORDER_NUMBER, 'debug', 'Payment Task - Step 2 - Get Payment Status from SOA - Failure Response  - ' + JSON.stringify(body));
                    logger.writePaymentTaskLog(LOG_ORDER_NUMBER, 'info', 'Payment Task - Step 2 - Get Payment Status from SOA - OUT');       
                    if(req.body.RETRY >= maxPaymentRetries) {
                        logger.writePaymentTaskLog(LOG_ORDER_NUMBER, 'debug', 'Payment Task - Step 2 - Get Payment Status from SOA - Proceeding to Close Payment as RETRY is more than 3 times - ' + req.body.RETRY);
                        req.payment_status = {};
                        req.payment_status.transaction_status = 'FAIL';
                        startPaymentTask(4, req, res, cdrParams);
                    }
                  }
                });
          });
    } catch(error) {
        logger.writePaymentTaskLog(LOG_ORDER_NUMBER, 'debug','Payment Task - Get Payment Status  from SOA - Error Caught - ' + error.stack);
    }
}

var mailToUser = function(req, res, cdrParams) {
    logger.writePaymentTaskLog(LOG_ORDER_NUMBER, 'debug','Payment Task - Step 3 - Mail to User - STARTS');
try {
    LOG_ORDER_NUMBER = req.body.ORDER_NO;
        var mailDesc = '';
        var toEmail = req.body.EMAIL;
        var sendEmail = false;
        var mailHeading = config.PAYMENT.MAIL_FAILURE_MESSAGE;
        if  (req.payment_status.transaction_status === 1 || req.payment_status.transaction_status === '1'
          || req.payment_status.transaction_status == 1 || req.payment_status.transaction_status == '1') {
            mailHeading = config.PAYMENT.MAIL_SUCCESS_MESSAGE;
            mailDesc = 'Transaction Approved';
            toEmail = config.MAIL_CC;
            sendEmail = false;
        }
        else if  (req.payment_status.transaction_status === 2 || req.payment_status.transaction_status === '2'
               || req.payment_status.transaction_status == 2 || req.payment_status.transaction_status == '2') {
                mailDesc = 'Transaction Declined';
        } else if  (req.payment_status.transaction_status === 3 || req.payment_status.transaction_status === '3'
        || req.payment_status.transaction_status == 3 || req.payment_status.transaction_status == '3') {
                mailDesc = 'Transaction Cancelled';
        } else if  (req.payment_status.transaction_status === 4 || req.payment_status.transaction_status === '4'
                 || req.payment_status.transaction_status == 4 || req.payment_status.transaction_status == '4') {
                mailDesc = 'Incomplete Transaction';
        } else {
                mailDesc = 'An error occured';
        }
        logger.writePaymentTaskLog(LOG_ORDER_NUMBER, 'info', 'Payment Task - Step 3 - Mail to User - Transaction Status - ' + req.body.TRANSACTION_ID +' - ' + mailDesc);
        if(sendEmail) {
            var mailBody = "<html><head>" +
            "<img src='http://stage-1app.mtn.co.za/webaxn/header.png'  style='width:100%;height:5%/></head><body style='width:100%'><p>Dear <b>Customer</b>,</p><br/>" + 
            mailHeading + "<br/><br/><table border='1' style='margin-left:50px' ><tr><td>AMOUNT</td><td>R" + 
            req.body.AMOUNT + "</td></tr><tr><td>MTN TRANSACTION ID</td><td>" +
            req.payment_status.paygate_transaction_id + "</td></tr><tr><td>Cell Number</td><td>" +
            req.body.MSISDN + "</td></tr><tr><td>Reason Description</td><td>"+
            mailDesc + "</td></tr></table><p>Regards,<br/><b>MyMTN</b><br/></body><footer><img src='http://stage-1app.mtn.co.za/webaxn/footer.png'  style='width:100%;height:10%'/></footer></html>";
            mailBody = encodeURIComponent(mailBody);
            const options = {
                method: 'GET',
                uri:  config.PAYMENT.WEBAXN_URL + 
                "GenericPlugin&Method=sendEmail" +
                "&username=" + mailUserName +
                "&password="+ mailPassword +
                "&to=" + toEmail +
                "&subject=" + mailSubject + 
                "&body="+ mailBody + 
                "&from=mymtnapp@mtn.co.za" +
                "&cc=" + mailCC +
                "&opco=sa",
                json: true,
                timeout: config.API_TIMEOUT,
            };
            utf8.encode(mailBody);
            utf8.encode(mailSubject);
            logger.writePaymentTaskLog(LOG_ORDER_NUMBER, 'info','Payment Task - Step 3 - Mail to User - Request URL for Sending Mail - ' + options.uri);
            // logger.writePaymentTaskLog(LOG_ORDER_NUMBER, 'info','Payment Task - Step 3 - Mail to User - Request Payload to WebAxn for Sending Mail - ' + JSON.stringify(options));
            request(options, function(error, response, body) {
            if(!error && response.statusCode == 200) {
                    logger.writePaymentTaskLog(LOG_ORDER_NUMBER, 'debug','Payment Task - Step 3 - Email Sending Success from WebAxn - ' +  JSON.stringify(response));
                    logger.writePaymentTaskLog(LOG_ORDER_NUMBER, 'debug','Payment Task - Step 3 - OUT');
                
            } else {
                    logger.writePaymentTaskLog(LOG_ORDER_NUMBER, 'warn','Payment Task - Step 3 - Email Sending Failure from WebAxn - ' + JSON.stringify(response));
                    logger.writePaymentTaskLog(LOG_ORDER_NUMBER, 'warn','Payment Task - Step 3 - Mail to User - ENDS');
            }
            });
        }
        logger.writePaymentTaskLog(LOG_ORDER_NUMBER, 'warn','Payment Task - Step 3 - Mail to User - ENDS');
        startPaymentTask(4, req, res, cdrParams);
} catch(err) {
    logger.writePaymentTaskLog(LOG_ORDER_NUMBER, 'debug','Payment Task - Step 3 - Mail to User - Error Caught in Try- ' + err.stack);
}
finally{
}
}
/* Mail to User Ends  */

/* Changing the status of Payment to Close STARTS */
var closePayment = function(req, res, cdrParams) {
logger.writePaymentTaskLog(LOG_ORDER_NUMBER, 'debug','Payment Task - Step 4 - Inserting into PAYMENT CLOSE Table - STARTS - ');
try{
    var insertPayload = {
        '_id': req.body.TRANSACTION_ID,
        ORDER_NO: req.body.ORDER_NO,
        REFERENCE: req.body.MSISDN,
        PAY_REQUEST_ID : req.body.PAY_REQUEST_ID,
        TRANSACTTION_STATUS: req.payment_status.transaction_status,
        RESULT_CODE: req.payment_status.result_code,
        AUTH_CODE: req.payment_status.auth_code,
        AMOUNT: req.body.AMOUNT,
        RESULT_DESC: req.payment_status.result_desc,
        TRANSACTION_ID : req.body.paygate_transaction_id,
        RISK_INDICATOR: req.payment_status.risk_indicator,
        RETRY: req.body.RETRY,
        PAY_METHOD: req.payment_status.pay_method,
        PAY_METHOD_DETAIL: req.payment_status.pay_method_detail,
        MSISDN: req.body.MSISDN,
        EMAIL : req.body.EMAIL,
        VAS_CODE : req.body.VAS_CODE,
        FACING_NAME: req.body.FACING_NAME,
        CHARGEABLE: req.body.CHARGEABLE,
        TRANSACTION_TYPE: req.body.TRANSACTION_TYPE,
        TRANSACTION_DATE: logger.getTransactionDate(),
      };
        logger.writePaymentTaskLog(LOG_ORDER_NUMBER, 'debug','Payment Task - Step 4 - Insert into PAYMENT CLOSE Table - Insert Payload - ' + JSON.stringify(insertPayload));
        mydb.insertOne(dbName, paymentCloseTable,insertPayload).then(response => {
        logger.writePaymentTaskLog(LOG_ORDER_NUMBER, 'debug','Payment Task - Step 4 - Insert into PAYMENT CLOSE Table - Insertion Successful - ' + JSON.stringify(response));
        var removeQuery = { PAY_REQUEST_ID : req.body.PAY_REQUEST_ID };
        if(!req.body.PAY_REQUEST_ID) {
            removeQuery = {ORDER_NO : req.body.ORDER_NO};
        }
        logger.writePaymentTaskLog(LOG_ORDER_NUMBER, 'debug','Payment Task - Step 4 - Remove from PAYMENT OPEN Table - Remove Query - ' + JSON.stringify(removeQuery));
        mydb.removeOne(dbName, paymentOpenTable, removeQuery).then(response => {
            logger.writePaymentTaskLog(LOG_ORDER_NUMBER, 'debug','Payment Task - Step 4 - Remove from PAYMENT OPEN Table - Removal Success' + JSON.stringify(response));
            logger.writePaymentTaskLog(LOG_ORDER_NUMBER, 'debug','Payment Task - Step 4 - Insert into PAYMENT CLOSE Table - ENDS');
            if  (req.payment_status && req.payment_status.transaction_status === 1 || req.payment_status.transaction_status === '1'
                || req.payment_status.transaction_status == 1 || req.payment_status.transaction_status == '1') {
                    logger.writePaymentTaskLog(LOG_ORDER_NUMBER, 'debug','Payment Task - Step 4 - Inserting into PAYMENT CLOSE TABLE - Proceeding to Bundle Provisioning Since the TRANSACTION STATUS is 1');
                    startPaymentTask(5, req, res, cdrParams);
                } else {
                    // logger.writePaymentTaskLog(LOG_ORDER_NUMBER, 'debug','Payment Task - Step 4 - Inserting into PAYMENT CLOSE TABLE - for the Transaction that is RETRIED more than 3 times');
                }
        }).catch(err => {
            logger.writePaymentTaskLog(LOG_ORDER_NUMBER, 'warn','Payment Task - Step 4 - Remove from PAYMENT OPEN Table - Removal Failure - ' + err);
        });
      }).catch(err => {
          console.log('here');
        var removeQuery = { PAY_REQUEST_ID : req.body.PAY_REQUEST_ID };
        if(!req.body.PAY_REQUEST_ID) {
            removeQuery = {ORDER_NO : req.body.ORDER_NO};
        }
        logger.writePaymentTaskLog(LOG_ORDER_NUMBER, 'debug','Payment Task - Step 4 - Remove from PAYMENT OPEN Table - Remove Query - ' + JSON.stringify(removeQuery));
        mydb.removeOne(dbName, paymentOpenTable, removeQuery);
            logger.writePaymentTaskLog(LOG_ORDER_NUMBER, 'warn','Payment Task - Step 4 - Insert into PAYMENT CLOSE Table - Insertion Failure - ' + JSON.stringify(err));
      });
} catch(error) {
        logger.writePaymentTaskLog(LOG_ORDER_NUMBER, 'debug','Payment Task - Step 4 - Insert into PAYMENT CLOSE Table - Error Caught - ' +  error.stack);
}
finally {}
}
/* Changing the status of Payment to Close STARTS */

/* Inserting to Promise Open Table as Payment Transaction is Successful - STARTS */
var promiseOpen = function(req, res, cdrParams) {
    logger.writePaymentTaskLog(LOG_ORDER_NUMBER, 'debug','Payment Task - Step 5 - Insert into PROMISE OPEN Table - STARTS');
    try{
        var insertPayload = {
            '_id': req.body.TRANSACTION_ID,
            ORDER_NO: req.body.ORDER_NO,
            TRANSACTION_ID: req.body.TRANSACTION_ID,
            PAY_REQUEST_ID: req.body.PAY_REQUEST_ID,
            AMOUNT: req.body.AMOUNT,
            VAS_CODE: req.body.VAS_CODE,
            CHARGEABLE: req.body.CHARGEABLE,
            TRANSACTION_TYPE: req.body.TRANSACTION_TYPE,
            EMAIL: req.body.EMAIL,
            REFERENCE: req.body.MSISDN,
            STATUS: 'OPEN',
            RETRY: 1,
            MSISDN: req.body.MSISDN,
            TRANSACTION_TIME:  new Date(),
            TRANSACTION_DATE : logger.getTransactionDate()
        };
        logger.writePaymentTaskLog(LOG_ORDER_NUMBER, 'debug','Payment Task - Step 5 - Insert into PROMISE OPEN Table - Insert Payload - ' + JSON.stringify(insertPayload));
        mydb.insertOne(dbName, eppixOpenTable, insertPayload).then(response => {
            logger.writePaymentTaskLog(LOG_ORDER_NUMBER, 'debug','Payment Task - Step 5 - Insert into PROMISE OPEN Table - Insertion Success - ' + JSON.stringify(response));
            logger.writePaymentTaskLog(LOG_ORDER_NUMBER, 'debug','Payment Task - Step 5 - Insert into PROMISE OPEN Table - ENDS');
        }).catch(err => {
            logger.writePaymentTaskLog(LOG_ORDER_NUMBER, 'debug','Payment Task - Step 5 - Insert into PROMISE OPEN Table - Insertion Failure - ' + JSON.stringify(err));
            logger.writePaymentTaskLog(LOG_ORDER_NUMBER, 'debug','Payment Task - Step 5 - Insert into PROMISE OPEN Table - ENDS');
        });
    } catch(error) {
        logger.writePaymentTaskLog(LOG_ORDER_NUMBER, 'debug','Payment Task - Step 5 - Insert into PROMISE OPEN Table - Error Caught - ' + error.stack);
    }
    finally {}
}
/* Inserting to Promise Open Table as Payment Transaction is Successful - ENDS */



function millisToMinutesAndSeconds(millis) {
    var minutes = Math.floor(millis / 60000);
    return parseInt(minutes);
  }


module.exports = {
    startPaymentTask: startPaymentTask
}
