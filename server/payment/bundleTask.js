const logger = require('../utils/logger');
var request = require('request');
const config = require('../config');
const mydb = require('./mydb');
const maxRetries = config.PAYMENT.EPPIX_RETRIES;
const maxRetryPeriod = 1;

var dbName = config.PAYMENT.DB_NAME;
var promiseOpenTable = config.PAYMENT.PROMISE_OPEN_TABLE;
var promiseCloseTable = config.PAYMENT.PROMISE_CLOSE_TABLE;

var LOG_ORDER_NUMBER = '';

var startBundleTask = function(step, req, res, cdrParams) {
    if(req && req.body && req.body.ORDER_NO) {
        LOG_ORDER_NUMBER = req.body.ORDER_NO;
    }
    if(req && req.body && req.body.order_no) {
        LOG_ORDER_NUMBER = req.body.order_no;
    }
    if (step == 1) {
        checkOpenOrders(req, res, cdrParams);
    } else if(step == 2) {
        provisionBundle(req, res, cdrParams);
    } else if(step == 3) {
        promiseClose(req, res, cdrParams);
    }
}




var checkOpenOrders = (req, res, cdrParams) => {
    logger.writePaymentTaskLog(LOG_ORDER_NUMBER, 'info', 'Bundle Task - Step 1 - Checking the OPEN Status Transactions from PROMISE OPEN Table - STARTS');
    try{
            var findPayload = { STATUS: 'OPEN' };
            var singleRes;
            var res = '';
            var cdrParams = '';
            mydb.findMany(dbName, promiseOpenTable, findPayload).then(fresult => {
                logger.writePaymentTaskLog(LOG_ORDER_NUMBER, 'debug', 'Bundle Task - Step 1 - Result from Find - Success - ' + JSON.stringify(fresult));
                for (var i = 0; i < fresult.length; i++) {
                    singleRes = fresult[i];
                    logger.writePaymentTaskLog(LOG_ORDER_NUMBER, 'debug', 'Bundle Task - Step 1 - IN LOOP - ' + (i+1) + ' OUT OF '+ fresult.length + ' with PAY_REQUEST_ID - ' + singleRes.PAY_REQUEST_ID);
                    var req = { body: {}};
                    var nowDate = new Date();
                    console.log('here');
                    console.log('time - ' + singleRes.TRANSACTION_TIME.getTime);
                    // var minDiff = 16;
                    var minDiff = millisToMinutesAndSeconds(Math.abs(nowDate.getTime() -  singleRes.TRANSACTION_TIME.getTime()));
                    console.log('Diff in minutes - ' + minDiff);
                    if (minDiff >= maxRetryPeriod) {
                        LOG_ORDER_NUMBER = singleRes.ORDER_NO;
                        logger.writePaymentTaskLog(LOG_ORDER_NUMBER, 'info', 'Bundle Task - Step 1 - Starting the transaction which has details - ' + JSON.stringify(singleRes));
                        var updateQuery = { PAY_REQUEST_ID :  singleRes.PAY_REQUEST_ID };
                        singleRes.RETRY = singleRes.RETRY + 1;
                        var newRetry = singleRes.RETRY;
                        var updateValues = { RETRY:  newRetry };
                        logger.writePaymentTaskLog(LOG_ORDER_NUMBER, 'info', 'Bundle Task - Step 1 - Updating Retries from - ' + (singleRes.RETRY - 1) +' to ' + newRetry);
                        mydb.updateOne(dbName, promiseOpenTable, updateQuery, updateValues);
                            logger.writePaymentTaskLog(LOG_ORDER_NUMBER, 'info', 'Bundle Task - Step 1 - Updation Successful');
                            req.body = singleRes;
                            provisionBundle(req, res, cdrParams);
                            // logger.writePaymentTaskLog(LOG_ORDER_NUMBER, 'info', 'Payment Task - Step 1 - Checking Open Transactions - Loop ENDS for ' + (i+1) + ' OUT OF ' + result.length);
                      /*   }).catch(uerr => {
                            logger.writePaymentTaskLog(LOG_ORDER_NUMBER, 'info', 'Bundle Task - Step 1 - Updation Failure - ' + uerr);
                        }); */
                }
                }
            });
    } catch(err) {
        logger.writePaymentTaskLog(LOG_ORDER_NUMBER, 'debug', 'Bundle Task 1 - Error Caught - ' + err.stack);
    }
}

/* Provisioning the Bundle through ATG - STARTS */
var provisionBundle = function(req, res, cdrParams) {
    logger.writePaymentTaskLog(LOG_ORDER_NUMBER, 'debug','Bundle Task - Step 2 - Bundle Provisioning or Activating Bundle  - STARTS - ' + JSON.stringify(req));
    try{
            if (req.body.VAS_CODE == 'Airtime') {
                logger.writePaymentTaskLog(LOG_ORDER_NUMBER, 'debug','Bundle Task - Step 2 - Bundle Provisioning - Transaction Type is AIRTIME');
                var payload = {
                    "arg1": {
                        'atg-rest-class-type' : 'za.co.mtn.store.service.v1.bean.MTNVasDataRequestBean',
                        'transaction_id': logger.getTransactionID(),
                        'msisdn': req.body.MSISDN,
                        'amount': req.body.AMOUNT,
                        'source_system': config.ATG_SOURCE_SYS,
                        'email_address': req.body.EMAIL,
                        'ecommerce_reference_num': req.body.ORDER_NO,
                        'payment_gateway_ref_num': req.body.PAY_REQUEST_ID
                    }
                };
                logger.writePaymentTaskLog(LOG_ORDER_NUMBER, 'debug','Bundle Task - Step 2 - Bundle Provisioning - ATG Request Payload for Airtime - ' + JSON.stringify(payload));
                 const options = {
                    method: 'POST',
                    uri:  config.ATG_REST_URL + "card_airtime",
                    headers: {
                        "Authorization": "Basic " + config.ATG_REST_AUTH,
                        "Accept": "application/json",
                        "Content-Type": "application/json" 
                    },
                    body: payload,
                    json: true,
                  }
                    logger.writePaymentTaskLog(LOG_ORDER_NUMBER, 'debug','Bundle Task - Step 2 - Provision Bundle - Card Airtime - Request URL - ' + options.uri);
                    logger.writePaymentTaskLog(LOG_ORDER_NUMBER, 'debug','Bundle Task - Step 2 - Provision Bundle - Card Airtime - Request Payload - ' + JSON.stringify(options.body));
                request(options, function(error, response, body) {
                    console.log('here in bundle provisioning');
                    if(!error && response.statusCode == 200) {
                            logger.writePaymentTaskLog(LOG_ORDER_NUMBER, 'debug','Bundle Task - Step 2 - Airtime Provisioning - Success Response from ATG - ' + JSON.stringify(body));
                            logger.writePaymentTaskLog(LOG_ORDER_NUMBER, 'debug','Bundle Task - Step 2 - Airtime Provisioning - ENDS');
                        if (body.status_code === 0 || body.status_code === '0'  || body.status_code == 0 || body.status_code == '0' ) {
                            logger.writePaymentTaskLog(LOG_ORDER_NUMBER, 'debug','Bundle Task - Step 2 - Bundle Provisioning - StatusCode in Response is Zero - ' + JSON.stringify(body.status_code));
                            req.body.FINAL_STATUS = 'SUCCESS';
                            promiseClose(req, res, cdrParams);
                        } else {
                            logger.writePaymentTaskLog(LOG_ORDER_NUMBER, 'debug','Bundle Task - Step 2 - Bundle Provisioning - StatusCode in Response is not Zero - ' + JSON.stringify(body.status_code));
                            if (req.body.RETRY >= maxRetries) {
                                req.body.FINAL_STATUS = 'FAIL';
                                logger.writePaymentTaskLog(LOG_ORDER_NUMBER, 'debug','Bundle Task - Step 2 - Bundle Provisioning - Proceeding to Insert in Promise Close are RETRY is more than 3 times - ' + req.body.RETRY);
                                promiseClose(req, res, cdrParams);
                            }
                        }
                    } else {
                            logger.writePaymentTaskLog(LOG_ORDER_NUMBER, 'debug','Bundle Task - Step 2 - Airtime Provisioning - Failure Response from ATG - ' + JSON.stringify(response));
                            logger.writePaymentTaskLog(LOG_ORDER_NUMBER, 'debug','Bundle Task - Step 2 - Airtime Provisioning - ENDS');
                    }
                    });
            } else {
                logger.writePaymentTaskLog(LOG_ORDER_NUMBER, 'debug','Bundle Task - Step 2 - Bundle Provisioning - Transaction Type is BUNDLE');
                var payload ={
                    "arg1": {
                        'atg-rest-class-type' : 'za.co.mtn.store.service.v1.bean.MTNVasDataRequestBean',
                        'transaction_id': logger.getTransactionID(),
                        'msisdn': req.body.MSISDN,
                        'vas_code': req.body.VAS_CODE,
                        'chargeable': req.body.CHARGEABLE,
                        'source_system': config.ATG_SOURCE_SYS,
                        'email_address': req.body.EMAIL,
                        'ecommerce_reference_num': req.body.ORDER_NO,
                        'payment_gateway_ref_num': req.body.PAY_REQUEST_ID
                    },
                    "atg-rest-method": "(Lza/co/mtn/store/service/v1/bean/MTNVasDataRequestBean;)Lza/co/mtn/store/service/v1/bean/MTNRestOutputBean"
                  };
                 const options = {
                    method: 'POST',
                    uri:  config.ATG_REST_URL + "card_vas",
                    headers: {
                        "Authorization": "Basic " + config.ATG_REST_AUTH,
                        "Accept": "application/json",
                        "Content-Type": "application/json" 
                    },
                    body: payload,
                    json: true,
                    timeout: config.API_TIMEOUT,
                  };
                        logger.writePaymentTaskLog(LOG_ORDER_NUMBER, 'debug','Bundle Task - Step 2 - Bundle Provisioning - ATG Request URL for Bundles - ' + options.uri);
                        logger.writePaymentTaskLog(LOG_ORDER_NUMBER, 'debug','Bundle Task - Step 2 - Bundle Provisioning - ATG Request Payload for Bundles - ' + JSON.stringify(options.body));
                  request(options, function(error, response, body) {
                    if(!error && response.statusCode == 200) {
                            logger.writePaymentTaskLog(LOG_ORDER_NUMBER, 'debug','Bundle Task - Step 2 - Bundle Provisioning - Success Response from ATG - ' + JSON.stringify(body));
                            logger.writePaymentTaskLog(LOG_ORDER_NUMBER, 'debug','Bundle Task - Step 2 - Bundle Provisioning - ENDS');
                        if (body.status_code === 0 || body.status_code === '0' || body.status_code == 0 || body.status_code == '0' ) {
                            logger.writePaymentTaskLog(LOG_ORDER_NUMBER, 'debug','Bundle Task - Step 2 - Bundle Provisioning - StatusCode in Response is Zero - ' + JSON.stringify(body.status_code));
                            req.body.FINAL_STATUS = 'SUCCESS';
                            promiseClose(req, res, cdrParams);
                        } else {
                            logger.writePaymentTaskLog(LOG_ORDER_NUMBER, 'warn','Bundle Task - Step 2 - Bundle Provisioning - StatusCode in Response is not Zero - ' + JSON.stringify(body.status_code));
                            if (req.body.RETRY >= maxRetries) {
                                req.body.FINAL_STATUS = 'FAIL';
                                logger.writePaymentTaskLog(LOG_ORDER_NUMBER, 'debug','Bundle Task - Step 2 - Bundle Provisioning - Proceeding to Insert in Promise Close are RETRY is more than 3 times - ' + req.body.RETRY);
                                promiseClose(req, res, cdrParams);
                            }
                        }
                    } else {
                        logger.writePaymentTaskLog(LOG_ORDER_NUMBER, 'warn','Bundle Task - Step 2 - Bundle Provisioning - Failure Response from ATG - ' + JSON.stringify(response));
                        logger.writePaymentTaskLog(LOG_ORDER_NUMBER, 'debug','Bundle Task - Step 2 - Bundle Provisioning - ENDS');
                    }
                    });
            }
    } catch(error) {
        logger.writePaymentTaskLog(LOG_ORDER_NUMBER, 'warn','Bundle Task - Step 2 - Bundle Provisioning - Error Caught - ' + error.stack);
    }
    finally {}
}
/* Provisioning the Bundle through ATG - ENDS */

/* Inserting into Promise_CLose Table as Bundle Provisioning is successful or RETRY is more than 3 times - STARTS*/

var promiseClose = function(req, res, cdrParams) {
    logger.writePaymentTaskLog(LOG_ORDER_NUMBER, 'debug', 'Bundle Task - Step 3 - Insert into PROMISE CLOSE Table - STARTS');
    try{
        var insertPayload = {
            '_id': req.body.TRANSACTION_ID,
            TRANSACTION_ID: req.body.TRANSACTION_ID,
            REFERENCE: req.body.REFERENCE,
            AMOUNT: req.body.AMOUNT,
            RETRY: req.body.RETRY,
            MSISDN: req.body.MSISDN,
            TRANSACTION_DATE: new Date(),
            ORDER_NO: req.body.ORDER_NO,
            STATUS : req.body.FINAL_STATUS
        };
        logger.writePaymentTaskLog(LOG_ORDER_NUMBER, 'debug', 'Bundle Task - Step 3 - Insert into PROMISE CLOSE Table - Insert Payload - ' + JSON.stringify(insertPayload));
        mydb.insertOne(dbName, promiseCloseTable, insertPayload).then(response => {
            logger.writePaymentTaskLog(LOG_ORDER_NUMBER, 'debug','Bundle Task - Step 3 - Inserted into PROMISE CLOSE - Insertion Successful - ' + JSON.stringify(response));
            logger.writePaymentTaskLog(LOG_ORDER_NUMBER, 'debug','Bundle Task - Step 3 - Remove from PROMISE CLOSE - Remove Query - ' + JSON.stringify(removeQuery));
            var removeQuery = { PAY_REQUEST_ID : req.body.PAY_REQUEST_ID };
            mydb.removeOne(dbName, promiseOpenTable, removeQuery).then(response => {
                logger.writePaymentTaskLog(LOG_ORDER_NUMBER, 'debug','Bundle Task - Step 3 - Removed from PROMISE OPEN - Removal Successful - ' + JSON.stringify(response));
            }).catch(err => {
                logger.writePaymentTaskLog(LOG_ORDER_NUMBER, 'warn','Bundle Task - Step 3 - Removed from PROMISE OPEN - Removal Failed - ' + JSON.stringify(response));
            }); 
            logger.writePaymentTaskLog(LOG_ORDER_NUMBER, 'debug', 'Bundle Task - Step 3 - Insert into PROMISE CLOSE Table - ENDS');
        }).catch( err => {
            logger.writePaymentTaskLog(LOG_ORDER_NUMBER, 'warn','Bundle Task - Step 3 - Inserted into PROMISE CLOSE - Insertion Failed - ' + JSON.stringify(response));
        });
        logger.writePaymentTaskLog(LOG_ORDER_NUMBER, 'debug', 'Bundle Task - Step 3 - Insert into PROMISE CLOSE Table - ENDS');
    }
    catch(error) {
        logger.writePaymentTaskLog(LOG_ORDER_NUMBER, 'warn','Bundle Task - Step 3 - Insert into PROMISE CLOSE Table - Error Caught - ' + error.stack);
    }
    finally {}
}

/* Inserting into Promise_CLose Table as Bundle Provisioning is successful or RETRY is more than 3 times - ENDS */
function millisToMinutesAndSeconds(millis) {
    var minutes = Math.floor(millis / 60000);
    return parseInt(minutes);
  }


module.exports = {
    startBundleTask: startBundleTask
}