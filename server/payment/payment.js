var config = require('../config');
var mydb = require('./mydb');
var request = require('request');
var logger = require('../utils/logger');
var Promise = require('promise');
var utils = require('./utils');
const utf8 = require('utf8');
var md5 = require('blueimp-md5');

var dbName = config.PAYMENT.DB_NAME;
var paymentOpenTable = config.PAYMENT.PAYMENT_OPEN_TABLE;
var paymentCloseTable = config.PAYMENT.PAYMENT_CLOSE_TABLE;
var eppixOpenTable = config.PAYMENT.PROMISE_OPEN_TABLE;
var eppixCloseTable = config.PAYMENT.PROMISE_CLOSE_TABLE;
var mailUserName = config.PAYMENT.MAIL_USERNAME;
var mailPassword = config.PAYMENT.MAIL_PASSWORD;
var mailCC = config.PAYMENT.MAIL_CC;
var appName = config.PAYMENT.APP_NAME;
var LOG_ORDER_NUMBER;

var mailSubject = "MyMTN - Payment Transaction";
var mailBody = "<html><head>" +
"<img src=\'http://stage-1app.mtn.co.za/webaxn/header.png\'  style=\'width:100%;height:5%\'></head>" +
"<body style='width:100%'><p>Dear <b>Customer</b>,</p><br/>%customermessage<br/><br/><table border='1' style='margin-left:50px' ><tr><td>AMOUNT</td><td>%amount</td></tr><tr><td>MTN TRANSACTION ID</td><td>%transactionid</td></tr><tr><td>MSISDN</td><td>%msisdn</td></tr><tr><td>Reason Description</td><td>%responsedescription</td></tr></table><p>Regards,<br/><b>MyMTN</b><br/></body><footer><img src='http://stage-1app.mtn.co.za/webaxn/footer.png'  style='width:100%;height:10%'/></footer></html>";
var mailSuccessMessage = config.PAYMENT.MAIL_SUCCESS_MESSAGE;
var mailFailureMessage = config.PAYMENT.MAIL_FAILURE_MESSAGE;

/* Get soa_transaction_id from SOA Start*/

var startPaymentFlow = function(step, req, res, cdrParams) {
    if (req.body.ORDER_NO) {
        LOG_ORDER_NUMBER = req.body.ORDER_NO;
    }
    if (req.body.order_no) {
        LOG_ORDER_NUMBER = req.body.order_no;
    }
    if(step == 1) {
        getSOATransactionId(req, res, cdrParams);
    } else if(step == 2) {
        initiatePayment(req, res, cdrParams);
    } else if(step == 3) {
        getPayGatewayRequestId(req, res, cdrParams);
    } else if(step == 4) {
        openPayment(req, res, cdrParams);
    } else if(step == 5) {
      paymentgatewayRedirect(req, res, cdrParams);
    } else if(step == 6) {
        mailToUser(req, res, cdrParams);
    } else if(step == 7) {
       closePayment(req, res, cdrParams); 
    } else if(step == 8) {
       eppixOpen(req, res, cdrParams);
    } else if(step == 9 ) {
        provisionBundle(req, res, cdrParams);
    } else if(step == 10) {
        eppixClose(req, res, cdrParams);
    }
  }
/* Call SOA for getting SOA TransactionID STARTS*/
var getSOATransactionId = function(req,res,cdrParams) {
  logger.writePaymentLog(LOG_ORDER_NUMBER, 'debug','Payment Flow - Step 1 - Calling SOA for TransactionID - STARTS');
  try {
    req.body.transaction_date = logger.getTransactionDate();
    LOG_ORDER_NUMBER = req.body.order_no;
    const payload = {
      transaction_id: logger.getTransactionID(),
      system_id: config.PAYMENT.SOA_SYSTEM_ID,
      function_id: config.PAYMENT.SOA_FUNCTION_ID
  };
  const options = {
    method: 'POST',
    uri:  config.SOA_URL + "GenerateSOATransactionIdService/GenerateSOATransId/getSOATransactionID",
    json: true,
    headers: {
      "Authorization": "Basic " + config.REST_AUTH_SOA,
      "Accept": "application/json",
      "Content-Type": "application/json",
      "ENV": config.REST_ENV_SOA
    },
    timeout: config.API_TIMEOUT,
    body: payload
  }
  logger.writePaymentLog(LOG_ORDER_NUMBER, 'debug','Payment Flow - Step 1 - Calling SOA for TransactionID - Request URL - ' + JSON.stringify(options.uri));
  logger.writePaymentLog(LOG_ORDER_NUMBER, 'debug','Payment Flow - Step 1 - Calling SOA for TransactionID - Request Body - ' + JSON.stringify(options.body));
  request(options, function(error, response, body) {
    if((!error && response.statusCode == 200)
        && (body.status_code === '0' || body.status_code === 0 || body.status_code == '0' || body.status_code == 0)) {
      logger.writePaymentLog(LOG_ORDER_NUMBER, 'debug','Payment Flow - Step 1 - Calling SOA for TransactionID - Success Response  - ' + JSON.stringify(body));
      req.body.soa_transaction_id = response.body.soa_transaction_id;
      logger.writePaymentLog(LOG_ORDER_NUMBER, 'debug','Payment Flow - Step 1 - OUT');
      startPaymentFlow(2, req, res, cdrParams);
    } else {
      logger.writePaymentLog(LOG_ORDER_NUMBER, 'warn','Payment Flow - Step 1 - Calling SOA for TransactionID - Failure Response  - ' + JSON.stringify(body));
      logger.writePaymentLog(LOG_ORDER_NUMBER, 'warn','Payment Flow - Step 1 - Calling SOA for TransactionID - Failure Response  - ' + JSON.stringify(error));
      logger.writePaymentLog(LOG_ORDER_NUMBER, 'warn','Payment Flow - Step 1 - Calling SOA for TransactionID - Failure Response  - ' + JSON.stringify(response));
      logger.writePaymentLog(LOG_ORDER_NUMBER, 'warn','Payment Flow - Step 1 - Calling SOA for TransactionID - ENDS' + '\n');       
      utils.sendFailureBeforePayment(req, res, cdrParams);
    }
  });
  } catch(error) {
      logger.writePaymentLog(LOG_ORDER_NUMBER, 'warn','Payment Flow - Step 1 - Calling SOA for TransactionID - Error Caught - '+ '\n' + error.stack);
      utils.sendFailureBeforePayment(req, res, cdrParams);
  }
  finally {}
}
/* Call SOA for getting SOA TransactionID ENDS*/

/* Initiate Payment in DB STARTS */
var initiatePayment = function(req, res, cdrParams) {
  logger.writePaymentLog(LOG_ORDER_NUMBER, 'debug','Payment Flow - Step 2 - Inserting into PAYMENT_OPEN Table - STARTS');
    try {
        req.body.checksum = utils.checkSum(req);
        var payload = {
            '_id': req.body.soa_transaction_id,
            ORDER_NO: req.body.order_no,
            REFERENCE: req.body.msisdn,
            MSISDN: req.body.msisdn,
            AMOUNT: req.body.amount,
            VAS_CODE : req.body.vas_code,
            FACING_NAME: req.body.facing_name,
            CHARGEABLE: req.body.chargeable,
            TRANSACTION_DATE: logger.getTransactionDate(),
            TRANSACTION_ID : req.body.soa_transaction_id,
            EMAIL : req.body.email,
            TRANSACTION_TIME: new Date(),
            PAY_REQUEST_ID : '',
            RETRY: 1,
            STATUS: 'INITIAL',
            APP_NAME: appName,
            TRANSACTION_TYPE: req.body.trans_type,
          };
        logger.writePaymentLog(LOG_ORDER_NUMBER, 'debug','Payment Flow - Step 2 - Inserting into PAYMENT_OPEN Table - Insert Payload - ' + JSON.stringify(payload));
        mydb.insertOne(dbName, paymentOpenTable, payload).then( response => {
            logger.writePaymentLog(LOG_ORDER_NUMBER, 'debug','Payment Flow - Inserting into PAYMENT OPEN_Table - Insertion Success - Step 2 - ENDS');
            startPaymentFlow(3, req, res,cdrParams);
        }).catch(err => {
            logger.writePaymentLog(LOG_ORDER_NUMBER, 'warn','Payment Flow - Inserting into PAYMENT OPEN_Table - Insertion Failure - Step 2 - ENDS');
            utils.sendFailureBeforePayment(req, res, cdrParams);
        });
    } catch(error) {
        logger.writePaymentLog(LOG_ORDER_NUMBER, 'debug','Payment Flow - Step 2 - Inserting into PAYMENT_OPEN Table - Error Caught - ' + error.stack);
        utils.sendFailureBeforePayment(req, res, cdrParams);
    }
    finally{}
}
/* Initiate Payment in DB Ends */

/* getPatgateRequestId from SOA STARTS */
var getPayGatewayRequestId = function(req, res, cdrParams) {
  logger.writePaymentLog(LOG_ORDER_NUMBER, 'debug','Payment Flow - Step 3 - Calling SOA for PayRequestID - STARTS');
  try {
        var payload =  {
            "transaction_id": logger.getTransactionID(),
            "paygate_id": config.PAYMENT.PAYGATE_ID,
            "reference": req.body.msisdn,
            "amount": utils.getPaygateTransactionAmount(req.body.amount),
            "currency": config.PAYMENT.OPCO_CURR,
            "return_url": config.PAYMENT.RETURN_URL,
            "transaction_date": req.body.transaction_date,
            "locale": config.PAYMENT.OPCO_LOCALE,
            "country": config.PAYMENT.COUNTRY,
            "email": req.body.email,
            "notify_url": config.PAYMENT.NOTIFY_URL,
            "user1": req.body.soa_transaction_id,
            "user2": config.PAYMENT.CALLBACK_URL,
            "checksum": ''
        };
    payload.checksum = utils.checkSum(payload);
    const options = {
        method: 'POST',
        uri:  config.SOA_URL + "GetPaygateTransaction_ID/GetPaygateTransactionID/Query",
        json: true,
        headers: {
        "Authorization": "Basic " + config.REST_AUTH_SOA,
        "Accept": "application/json",
        "Content-Type": "application/json",
        "ENV": config.REST_ENV_SOA
        },
        timeout: config.API_TIMEOUT,
        body: payload
  };
  logger.writePaymentLog(LOG_ORDER_NUMBER, 'debug','Payment Flow - Step 3 - Calling SOA for PayRequestID - Request URL - ' + JSON.stringify(options.uri));
  logger.writePaymentLog(LOG_ORDER_NUMBER, 'debug','Payment Flow - Step 3 - Calling SOA for PayRequestID - Request Body - ' + JSON.stringify(options.body));
  request(options, function(error, response, body) {
    if((!error && response.statusCode == 200) &&
        (body.status_code == 0 || body.status_code == '0' || body.status_code === 0 || body.status_code === '0')) {
      logger.writePaymentLog(LOG_ORDER_NUMBER, 'debug','Payment Flow - Step 3 - Calling SOA for PayRequestID - Success Response from SOA - ' + JSON.stringify(body));
      req.body.updatePayload = {
        PAY_REQUEST_ID : body.pay_request_id,
        TRANSACTION_TIME: new Date(),
        STATUS: 'OPEN'
      };
      req.body.pay_request_id = body.pay_request_id;
      logger.writePaymentLog(LOG_ORDER_NUMBER, 'debug','Payment Flow - Step 3 - Calling SOA for PayRequestID - ENDS');
      startPaymentFlow(4, req, res, cdrParams);
    } else {
      logger.writePaymentLog(LOG_ORDER_NUMBER, 'warn','Payment Flow - Step 3 - Calling SOA for PayRequestID - Failure Response from SOA - ' + JSON.stringify(body));
      logger.writePaymentLog(LOG_ORDER_NUMBER, 'warn','Payment Flow - Step 3 - Calling SOA for PayRequestID - Failure Response from SOA - ' + JSON.stringify(error));
      logger.writePaymentLog(LOG_ORDER_NUMBER, 'warn','Payment Flow - Step 3 - Calling SOA for PayRequestID - Failure Response from SOA - ' + JSON.stringify(response));
      logger.writePaymentLog(LOG_ORDER_NUMBER, 'warn','Payment Flow - Step 3 - Calling SOA for PayRequestID - ENDS');
      utils.sendFailureBeforePayment(req, res, cdrParams);
    }
  });
  } catch (error) {
      logger.writePaymentLog(LOG_ORDER_NUMBER, 'warn','Payment Flow - Step 3 - Calling SOA for PayRequestID - Error Caught - ' +  error + '\n' + error.stack);
      utils.sendFailureBeforePayment(req, res, cdrParams);
  }
  finally {}
 
}
/* getPatgateRequestId from SOA Ends */

/* Change the Payment Status to Open ENDS*/
var openPayment = function(req, res, cdrParams) {
  logger.writePaymentLog(LOG_ORDER_NUMBER, 'debug','Payment Flow - Step 4 - Updating PAYMENT_OPEN Table with OPEN STATUS - STARTS');
  try {
    var myquery = { TRANSACTION_ID :  req.body.soa_transaction_id };
    var newvalues = req.body.updatePayload;
    logger.writePaymentLog(LOG_ORDER_NUMBER, 'debug','Payment Flow - Step 4 - Updating PAYMENT_OPEN Table - Update Query - ' + JSON.stringify(myquery));
    logger.writePaymentLog(LOG_ORDER_NUMBER, 'debug','Payment Flow - Step 4 - Updating PAYMENT_OPEN Table - Update Values - ' + JSON.stringify(newvalues));
    mydb.updateOne(dbName, paymentOpenTable, myquery, newvalues).then( upres => {
        logger.writePaymentLog(LOG_ORDER_NUMBER, 'debug','Payment Flow - Step 4 - Updating PAYMENT_OPEN Table - Update Values - Success');
        logger.writePaymentLog(LOG_ORDER_NUMBER, 'debug','Payment Flow - Step 4 - Updating PAYMENT_OPEN Table - ENDS');
        startPaymentFlow(5, req, res, cdrParams);
    });
  } catch(error) {
      logger.writePaymentLog(LOG_ORDER_NUMBER, 'warn','Payment Flow - Step 4 - Updating PAYMENT_OPEN Table - Error Caught - ' + error + '\n' +error.stack);
      utils.sendFailureBeforePayment(req, res, cdrParams);
  }
  finally {}
}
/* Change the Payment Status to Open ENDS*/

/* Step 5 is sending response to user and making client to post the form to node */

function paymentgatewayRedirect(req, res, cdrParams) {
    try {
        logger.writePaymentLog(LOG_ORDER_NUMBER, 'debug', 'Step 5 - Payment Gateway Redirection -  STARTS');
        var checkSumStr = '' + config.PAYMENT.PAYGATE_ID + req.body.pay_request_id + req.body.msisdn + config.PAYMENT.PAYGATE_KEY + '';
        var checkSum = md5(checkSumStr);
	    logger.writePaymentLog(LOG_ORDER_NUMBER, 'debug', 'Step 5 - Payment Gateway Redirection -  Setting up the CheckSum - ' + checkSumStr);
	    var form = "<!DOCTYPE html><html><body><p>You are being redirected...Please wait</p>" +
					"<form action=" + config.PAYMENT.PAYGATE_URL + " method='POST' name='paymentResponse'>" +
					"<input type='hidden' name='PAY_REQUEST_ID' value='"+req.body.pay_request_id +"'> " +
					"<input type='hidden' name='CHECKSUM' value='" + checkSum + "'></form> " +
					"<script language='JavaScript'>document.forms['paymentResponse'].submit();</script></body></html>";
        logger.writePaymentLog(LOG_ORDER_NUMBER, 'debug', 'Step 5 - Payment Gateway Redirection -  Form Submitting to Payment Gateway - ' + JSON.stringify(form));
        res.set('Content-Type', 'text/html');
        logger.writePaymentLog(LOG_ORDER_NUMBER, 'debug', 'Step 5 - Payment Gateway Redirection -  REDIRECTION STARTS');
		res.send(form);
    } catch(error) {
        logger.writePaymentLog(LOG_ORDER_NUMBER, 'warn','Payment Flow - Step 5 - Payment Gateway Redirection - Error Caught - ' + error + '\n' +error.stack);
        utils.sendFailureBeforePayment(req, res, cdrParams);
    }
    
}

/* Mail to User Starts */
var mailToUser = function(req, res, cdrParams) {
    LOG_ORDER_NUMBER = req.body.ORDER_NO;
        logger.writePaymentLog(LOG_ORDER_NUMBER, 'debug','Payment Flow - Step 6 - Mail to User - STARTS');
    try {
        logger.writePaymentLog(LOG_ORDER_NUMBER, 'debug','Payment Flow - Step 6 - Mail to User - STARTS');
        var findQuery = { PAY_REQUEST_ID : req.body.PAY_REQUEST_ID };
        logger.writePaymentLog(LOG_ORDER_NUMBER, 'debug','Payment Flow - Step 6 - Mail to User - Setting Payload to Find Details, After Redirecting from PaymentGateway - ' + JSON.stringify(findQuery));
        mydb.findOne(dbName, paymentOpenTable, findQuery).then( response => {
            logger.writePaymentLog(LOG_ORDER_NUMBER, 'debug','Payment Flow - Step 6 - Mail to User - Getting Response for Find, After Redirecting from PaymentGateway - ' + JSON.stringify(response));
            req.body.msisdn = response.MSISDN;
            req.body.amount = response.AMOUNT;
            req.body.soa_transaction_id = response.TRANSACTION_ID;
            req.body.email = response.EMAIL;
            req.body.vas_code = response.VAS_CODE;
            req.body.chargeable = response.CHARGEABLE;
            req.body.trans_type = response.TRANSACTION_TYPE;
            req.body.reference = response.REFERENCE;
            req.body.facing_name = response.FACING_NAME;
            req.body.pay_request_id = response.PAY_REQUEST_ID;
            req.body.order_no = response.ORDER_NO;
            var mailDesc = '';
            var toEmail = response.EMAIL;
			var sendEmail = false;
            var mailHeading = config.PAYMENT.MAIL_FAILURE_MESSAGE;
            if  (req.body.TRANSACTION_STATUS === 1 || req.body.TRANSACTION_STATUS === '1'
              || req.body.TRANSACTION_STATUS == 1 || req.body.TRANSACTION_STATUS == '1') {
                mailHeading = config.PAYMENT.MAIL_SUCCESS_MESSAGE;
                mailDesc = 'Transaction Approved';
                toEmail = config.MAIL_CC;
				sendEmail = false;
            }
            else if  (req.body.TRANSACTION_STATUS === 2 || req.body.TRANSACTION_STATUS === '2'
                   || req.body.TRANSACTION_STATUS == 2 || req.body.TRANSACTION_STATUS == '2') {
                mailDesc = 'Transaction Declined';
            } else if  (req.body.TRANSACTION_STATUS === 3 || req.body.TRANSACTION_STATUS === '3'
            || req.body.TRANSACTION_STATUS == 3 || req.body.TRANSACTION_STATUS == '3') {
                mailDesc = 'Transaction Cancelled';
            } else if  (req.body.TRANSACTION_STATUS === 4 || req.body.TRANSACTION_STATUS === '4'
                     || req.body.TRANSACTION_STATUS == 4 || req.body.TRANSACTION_STATUS == '4') {
                mailDesc = 'Incomplete Transaction';
            } else {
                mailDesc = 'An error occured';
            }
            logger.writePaymentLog(LOG_ORDER_NUMBER, 'info', 'Payment Flow - Step 6 - Mail to User - Transaction Status - ' + req.body.TRANSACTION_ID +' - ' + mailDesc);
			if(sendEmail) {
                var mailBody = "<html><head>" +
                "<img src='http://stage-1app.mtn.co.za/webaxn/header.png'  style='width:100%;height:5%/></head><body style='width:100%'><p>Dear <b>Customer</b>,</p><br/>" + 
                mailHeading + "<br/><br/><table border='1' style='margin-left:50px' ><tr><td>AMOUNT</td><td>R" + 
                response.AMOUNT + "</td></tr><tr><td>MTN TRANSACTION ID</td><td>" +
                response.TRANSACTION_ID + "</td></tr><tr><td>Cell Number</td><td>" +
                response.MSISDN + "</td></tr><tr><td>Reason Description</td><td>"+
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
            logger.writePaymentLog(LOG_ORDER_NUMBER, 'info','Payment Flow - Step 6 - Mail to User - Request URL for Sending Mail - ' + options.uri);
            // logger.writePaymentLog(LOG_ORDER_NUMBER, 'info','Payment Flow - Step 6 - Mail to User - Request Payload to WebAxn for Sending Mail - ' + JSON.stringify(options));
			request(options, function(error, response, body) {
            if(!error && response.statusCode == 200) {
                    logger.writePaymentLog(LOG_ORDER_NUMBER, 'debug','Payment Flow - Step 6 - Email Sending Success from WebAxn - ' +  JSON.stringify(body));
                    logger.writePaymentLog(LOG_ORDER_NUMBER, 'debug','Payment Flow - Step 6 - OUT');    
                
            } else {
                    logger.writePaymentLog(LOG_ORDER_NUMBER, 'warn','Payment Flow - Step 6 - Email Sending Failure from WebAxn - ' + JSON.stringify(response));
                    logger.writePaymentLog(LOG_ORDER_NUMBER, 'warn','Payment Flow - Step 6 - Mail to User - ENDS');
            }
			});
			}
            startPaymentFlow(7, req, res, cdrParams);
        });
    } catch(err) {
        logger.writePaymentLog(LOG_ORDER_NUMBER, 'debug','Payment Flow - Step 6 - Mail to User - Error Caught in Try- ' + err.stack);
        utils.sendFailureAfterPayment(req, res, cdrParams);
    }
    finally{
    }
}
/* Mail to User Ends  */

/* Changing the status of Payment to Close STARTS */
var closePayment = function(req, res, cdrParams) {
    logger.writePaymentLog(LOG_ORDER_NUMBER, 'debug','Payment Flow - Step 7 - Inserting into PAYMENT CLOSE Table - STARTS');
    try{
        var insertPayload = {
            '_id': req.body.USER1.toString(),
            ORDER_NO: req.body.order_no,
            REFERENCE: req.body.reference,
            PAY_REQUEST_ID : req.body.pay_request_id,
            TRANSACTION_STATUS: req.body.TRANSACTION_STATUS,
            RESULT_CODE: req.body.RESULT_CODE,
            AUTH_CODE: req.body.AUTH_CODE,
            AMOUNT: req.body.amount,
            RESULT_DESC: req.body.RESULT_DESC,
            TRANSACTION_ID : req.body.USER1,
            RISK_INDICATOR: req.body.RISK_INDICATOR,
            RETRY: 1,
            PAY_METHOD: req.body.PAY_METHOD,
            PAY_METHOD_DETAIL: req.body.PAY_METHOD_DETAIL,
            MSISDN: req.body.msisdn,
            EMAIL : req.body.email,
            VAS_CODE : req.body.vas_code,
            FACING_NAME: req.body.facing_name,
            CHARGEABLE: req.body.chargeable,
            TRANSACTION_TYPE: req.body.trans_type,
            TRANSACTION_DATE: logger.getTransactionDate(),
          };
            logger.writePaymentLog(LOG_ORDER_NUMBER, 'debug','Payment Flow - Step 7 - Insert into PAYMENT CLOSE Table - Insert Payload - ' + JSON.stringify(insertPayload));
          mydb.insertOne(dbName, paymentCloseTable,insertPayload).then(response => {
            logger.writePaymentLog(LOG_ORDER_NUMBER, 'debug','Payment Flow - Step 7 - Insert into PAYMENT CLOSE Table - Insertion Successful - ' + JSON.stringify(response));
            var removeQuery = { PAY_REQUEST_ID : req.body.pay_request_id };
            logger.writePaymentLog(LOG_ORDER_NUMBER, 'debug','Payment Flow - Step 7 - Remove from PAYMENT OPEN Table - Remove Query - ' + JSON.stringify(removeQuery));
            mydb.removeOne(dbName, paymentOpenTable, removeQuery).then(response => {
                logger.writePaymentLog(LOG_ORDER_NUMBER, 'debug','Payment Flow - Step 7 - Remove from PAYMENT OPEN Table - Removal Success' + JSON.stringify(response));
                logger.writePaymentLog(LOG_ORDER_NUMBER, 'debug','Payment Flow - Step 7 - Insert into PAYMENT CLOSE Table - ENDS');
                if  (req.body.TRANSACTION_STATUS === 1 || req.body.TRANSACTION_STATUS === '1'
                  || req.body.TRANSACTION_STATUS == 1 || req.body.TRANSACTION_STATUS == '1') {
                        logger.writePaymentLog(LOG_ORDER_NUMBER, 'debug','Payment Flow - Step 7 - Inserting into PAYMENT CLOSE TABLE - ' + 'Proceeding to Bundle Provisioning Since the TRANSACTION STATUS is 1');
                        startPaymentFlow(8, req, res, cdrParams);
                    }
            }).catch(err => {
                logger.writePaymentLog(LOG_ORDER_NUMBER, 'warn','Payment Flow - Step 7 - Remove from PAYMENT OPEN Table - Removal Failure - ' + err);
            });
          }).catch(err => {
                logger.writePaymentLog(LOG_ORDER_NUMBER, 'warn','Payment Flow - Step 7 - Insert into PAYMENT CLOSE Table - Insertion Failure - ' + JSON.stringify(err));
                utils.sendFailureAfterPayment(req, res, cdrParams);
          });
    } catch(error) {
            logger.writePaymentLog(LOG_ORDER_NUMBER, 'debug','Payment Flow - Step 7 - Insert into PAYMENT CLOSE Table - Error Caught - ' +  error.stack + ' - ' + req.body.USER1.toString());
        utils.sendFailureAfterPayment(req, res, cdrParams);
    }
    finally {}
}
/* Changing the status of Payment to Close STARTS */

/* Inserting to Promise Open Table as Payment Transaction is Successful - STARTS */
var eppixOpen = function(req, res, cdrParams) {
    
    logger.writePaymentLog(LOG_ORDER_NUMBER, 'debug','Payment Flow - Step 8 - Insert into PROMISE OPEN Table - STARTS');
    try{
        var insertPayload1 = {
            '_id': req.body.soa_transaction_id,
            ORDER_NO: req.body.order_no,
            TRANSACTION_ID: req.body.soa_transaction_id,
            PAY_REQUEST_ID: req.body.pay_request_id,
            AMOUNT: req.body.amount,
            VAS_CODE: req.body.vas_code,
            CHARGEABLE: req.body.chargeable,
            TRANS_TYPE: req.body.trans_type,
            EMAIL: req.body.email,
            REFERENCE: req.body.reference,
            STATUS: 'OPEN',
            RETRY: 1,
            MSISDN: req.body.msisdn,
            TRANSACTION_TIME:  new Date(),
            TRANSACTION_DATE : logger.getTransactionDate()
        };
        logger.writePaymentLog(LOG_ORDER_NUMBER, 'debug','Payment Flow - Step 8 - Insert into PROMISE OPEN Table - Insert Payload - ' + JSON.stringify(insertPayload1));
        mydb.insertOne(dbName, eppixOpenTable, insertPayload1).then(response => {
            logger.writePaymentLog(LOG_ORDER_NUMBER, 'debug','Payment Flow - Step 8 - Insert into PROMISE OPEN Table - Insertion Success - ' + JSON.stringify(response));
            logger.writePaymentLog(LOG_ORDER_NUMBER, 'debug','Payment Flow - Step 8 - Insert into PROMISE OPEN Table - ENDS');
            startPaymentFlow(9, req, res, cdrParams);
        }).catch(err => {
            logger.writePaymentLog(LOG_ORDER_NUMBER, 'debug','Payment Flow - Step 8 - Insert into PROMISE OPEN Table - Insertion Failure - ' + JSON.stringify(err));
            logger.writePaymentLog(LOG_ORDER_NUMBER, 'debug','Payment Flow - Step 8 - Insert into PROMISE OPEN Table - ENDS');
            utils.sendFailureAfterPayment(req, res, cdrParams);
        });
    } catch(error) {
        logger.writePaymentLog(LOG_ORDER_NUMBER, 'debug','Payment Flow - Step 8 - Insert into PROMISE OPEN Table - Error Caught - ' + error.stack);
        utils.sendFailureAfterPayment(req, res, cdrParams);
    }
    finally {}
}
/* Inserting to Promise Open Table as Payment Transaction is Successful - ENDS */

/* Provisioning the Bundle through ATG - STARTS */
var provisionBundle = function(req, res, cdrParams) {
    logger.writePaymentLog(LOG_ORDER_NUMBER, 'debug','Payment Flow - Step 9 - Bundle Provisioning or Activating Bundle  - STARTS');
    try{
            if (req.body.vas_code == 'Airtime') {
                logger.writePaymentLog(LOG_ORDER_NUMBER, 'debug','Payment Flow - Step 9 - Bundle Provisioning - Transaction Type is AIRTIME');
                var payload = {
                    "arg1": {
                        'atg-rest-class-type' : 'za.co.mtn.store.service.v1.bean.MTNVasDataRequestBean',
                        'transaction_id': logger.getTransactionID(),
                        'msisdn': req.body.msisdn,
                        'amount': req.body.amount,
                        'source_system': config.ATG_SOURCE_SYS,
                        'email_address': req.body.email,
                        'ecommerce_reference_num': req.body.order_no,
                        'payment_gateway_ref_num': req.body.pay_request_id
                    }
                };
                logger.writePaymentLog(LOG_ORDER_NUMBER, 'debug','Payment Flow - Step 9 - Bundle Provisioning - ATG Request Payload for Airtime - ' + JSON.stringify(payload));
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
                    logger.writePaymentLog(LOG_ORDER_NUMBER, 'debug','Payment Flow - Step 9 - Provision Bundle - Card Airtime - Request URL - ' + options.uri);
                    logger.writePaymentLog(LOG_ORDER_NUMBER, 'debug','Payment Flow - Step 9 - Provision Bundle - Card Airtime - Request Payload - ' + JSON.stringify(options.body));
                request(options, function(error, response, body) {
                    console.log('here in bundle provisioning');
                    if(!error && response.statusCode == 200) {
                            logger.writePaymentLog(LOG_ORDER_NUMBER, 'debug','Payment Flow - Step 9 - Airtime Provisioning - Success Response from ATG - ' + JSON.stringify(body));
                            logger.writePaymentLog(LOG_ORDER_NUMBER, 'debug','Payment Flow - Step 9 - Airtime Provisioning - ENDS');
                        if (body.status_code === 0 || body.status_code === '0'  || body.status_code == 0 || body.status_code == '0' ) {
                            logger.writePaymentLog(LOG_ORDER_NUMBER, 'debug','Payment Flow - Step 9 - Bundle Provisioning - StatusCode in Response is Zero - ' + JSON.stringify(body.status_code));
                            req.body.FINAL_STATUS = 'SUCCESS';
                            startPaymentFlow(10, req, res, cdrParams);
                        } else {
							req.body.FINAL_STATUS = 'FAIL';
                            startPaymentFlow(10, req, res, cdrParams);
                            logger.writePaymentLog(LOG_ORDER_NUMBER, 'debug','Payment Flow - Step 9 - Bundle Provisioning - StatusCode in Response is not Zero - ' + JSON.stringify(body.status_code));
                            utils.sendFailureAfterPayment(req, res, cdrParams, response);
                        }
                    } else {
                            logger.writePaymentLog(LOG_ORDER_NUMBER, 'debug','Payment Flow - Step 9 - Airtime Provisioning - Failure Response from ATG - ' + JSON.stringify(body));
                            logger.writePaymentLog(LOG_ORDER_NUMBER, 'debug','Payment Flow - Step 9 - Airtime Provisioning - Failure Response from ATG - ' + JSON.stringify(error));
                            logger.writePaymentLog(LOG_ORDER_NUMBER, 'debug','Payment Flow - Step 9 - Airtime Provisioning - Failure Response from ATG - ' + JSON.stringify(response));
                            logger.writePaymentLog(LOG_ORDER_NUMBER, 'debug','Payment Flow - Step 9 - Airtime Provisioning - ENDS');
                            utils.sendFailureAfterPayment(req, res, cdrParams, response);
                    }
                    });
            } else {
                logger.writePaymentLog(LOG_ORDER_NUMBER, 'debug','Payment Flow - Step 9 - Bundle Provisioning - Transaction Type is BUNDLE');
                var payload ={
                    "arg1": {
                        'atg-rest-class-type' : 'za.co.mtn.store.service.v1.bean.MTNVasDataRequestBean',
                        'transaction_id': logger.getTransactionID(),
                        'msisdn': req.body.msisdn,
                        'vas_code': req.body.vas_code,
                        'chargeable': req.body.chargeable,
                        'source_system': config.ATG_SOURCE_SYS,
                        'email_address': req.body.email,
                        'ecommerce_reference_num': req.body.order_no,
                        'payment_gateway_ref_num': req.body.pay_request_id
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
                        logger.writePaymentLog(LOG_ORDER_NUMBER, 'debug','Payment Flow - Step 9 - Bundle Provisioning - ATG Request URL for Bundles - ' + options.uri);
                        logger.writePaymentLog(LOG_ORDER_NUMBER, 'debug','Payment Flow - Step 9 - Bundle Provisioning - ATG Request Payload for Bundles - ' + JSON.stringify(options.body));
                  request(options, function(error, response, body) {
                    if(!error && response.statusCode == 200) {
                            logger.writePaymentLog(LOG_ORDER_NUMBER, 'debug','Payment Flow - Step 9 - Bundle Provisioning - Success Response from ATG - ' + JSON.stringify(body));
                            logger.writePaymentLog(LOG_ORDER_NUMBER, 'debug','Payment Flow - Step 9 - Bundle Provisioning - ENDS');
                        if (body.status_code === 0 || body.status_code === '0' || body.status_code == 0 || body.status_code == '0' ) {
                            logger.writePaymentLog(LOG_ORDER_NUMBER, 'debug','Payment Flow - Step 9 - Bundle Provisioning - StatusCode in Response is Zero - ' + JSON.stringify(body.status_code));
                            req.body.FINAL_STATUS = 'SUCCESS';
                            startPaymentFlow(10, req, res, cdrParams);
                        } else {
							req.body.FINAL_STATUS = 'FAIL';
                            startPaymentFlow(10, req, res, cdrParams);
                            logger.writePaymentLog(LOG_ORDER_NUMBER, 'warn','Payment Flow - Step 9 - Bundle Provisioning - StatusCode in Response is not Zero - ' + JSON.stringify(body.status_code));
                        }
                    } else {
                        logger.writePaymentLog(LOG_ORDER_NUMBER, 'warn','Payment Flow - Step 9 - Bundle Provisioning - Failure Response from ATG - ' + JSON.stringify(error));
                        logger.writePaymentLog(LOG_ORDER_NUMBER, 'debug','Payment Flow - Step 9 - Bundle Provisioning - ENDS');
                    }
                    });
            }
    } catch(error) {
        logger.writePaymentLog(LOG_ORDER_NUMBER, 'warn','Payment Flow - Step 9 - Bundle Provisioning - Error Caught - ' + error.stack);
    }
    finally {}
}
/* Provisioning the Bundle through ATG - ENDS */

/* Inserting into Promise_CLose Table as Bundle Provisioning is successful or RETRY is more than 3 times - STARTS*/

var eppixClose = function(req, res, cdrParams) {
    logger.writePaymentLog(LOG_ORDER_NUMBER, 'debug', 'Payment Flow - Step 10 - Insert into PROMISE CLOSE Table - STARTS');
    try{
        var insertPayload = {
            '_id': req.body.soa_transaction_id,
            TRANSACTION_ID: req.body.soa_transaction_id,
            REFERENCE: req.body.reference,
            AMOUNT: req.body.amount,
            RETRY: 1,
            MSISDN: req.body.msisdn,
            TRANSACTION_DATE: new Date(),
            ORDER_NO: req.body.order_no,
            STATUS : req.body.FINAL_STATUS
        };
        logger.writePaymentLog(LOG_ORDER_NUMBER, 'debug', 'Payment Flow - Step 10 - Insert into PROMISE CLOSE Table - Insert Payload - ' + JSON.stringify(insertPayload));
        mydb.insertOne(dbName, eppixCloseTable, insertPayload).then(response => {
            logger.writePaymentLog(LOG_ORDER_NUMBER, 'debug','Payment Flow - Step 10 - Inserted into PROMISE CLOSE - Insertion Successful - ' + JSON.stringify(response));
            logger.writePaymentLog(LOG_ORDER_NUMBER, 'debug','Payment Flow - Step 10 - Remove from PROMISE CLOSE - Remove Query - ' + JSON.stringify(removeQuery));
            var removeQuery = { PAY_REQUEST_ID : req.body.PAY_REQUEST_ID };
            mydb.removeOne(dbName, eppixOpenTable, removeQuery).then(response => {
                logger.writePaymentLog(LOG_ORDER_NUMBER, 'debug','Payment Flow - Step 10 - Removed from PROMISE OPEN - Removal Successful - ' + JSON.stringify(response));
            }).catch(err => {
                logger.writePaymentLog(LOG_ORDER_NUMBER, 'warn','Payment Flow - Step 10 - Removed from PROMISE OPEN - Removal Failed - ' + JSON.stringify(response));
            }); 
            logger.writePaymentLog(LOG_ORDER_NUMBER, 'debug', 'Payment Flow - Step 10 - Insert into PROMISE CLOSE Table - ENDS');
        }).catch( err => {
            logger.writePaymentLog(LOG_ORDER_NUMBER, 'warn','Payment Flow - Step 10 - Inserted into PROMISE CLOSE - Insertion Failed - ' + JSON.stringify(response));
        });
        logger.writePaymentLog(LOG_ORDER_NUMBER, 'debug', 'Payment Flow - Step 10 - Insert into PROMISE CLOSE Table - ENDS');
    }
    catch(error) {
        logger.writePaymentLog(LOG_ORDER_NUMBER, 'warn','Payment Flow - Step 10 - Insert into PROMISE CLOSE Table - Error Caught - ' + error.stack);
        utils.sendFailureAfterPayment(req, res, cdrParams);
    }
    finally {}
}

/* Inserting into Promise_CLose Table as Bundle Provisioning is successful or RETRY is more than 3 times - ENDS */

module.exports = {
    startPaymentFlow: startPaymentFlow,
}
