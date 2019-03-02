var payment = require('./payment');
var config = require('../config');
var mydb = require('./mydb');
var logger = require('../utils/logger');
var md5 = require('blueimp-md5');
const mongo = require('mongodb');
var Promise = require('promise');
var dbName = config.PAYMENT.DB_NAME;
var paymentOpenTable = config.PAYMENT.PAYMENT_OPEN_TABLE;
var LOG_ORDER_NUMBER = payment.LOG_ORDER_NUMBER;

var mailUserName = config.PAYMENT.MAIL_USERNAME;
var mailPassword = config.PAYMENT.MAIL_PASSWORD;
var mailCC = config.PAYMENT.MAIL_CC;
var myMailID = 'sai.rohit@mahindracomviva.com';


/* Calculate CheckSum  */
var checkSum = function(payload) {
    logger.writePaymentLog(LOG_ORDER_NUMBER, 'debug','Payment Flow - Calculate CheckSum for PaygateRequestId API - STARTS');
    try {
        var checkSumStr = 
                    config.PAYMENT.PAYGATE_ID
                  + payload.reference 
                  + payload.amount 
                  + config.PAYMENT.OPCO_CURR
                  + config.PAYMENT.RETURN_URL
                  + payload.transaction_date
                  + config.PAYMENT.OPCO_LOCALE
                  + config.PAYMENT.COUNTRY
                  + payload.email
                  + config.PAYMENT.NOTIFY_URL
                  + payload.user1
                  + config.PAYMENT.CALLBACK_URL
                  + config.PAYMENT.PAYGATE_KEY;
        var checkSum = md5(checkSumStr);
        logger.writePaymentLog(LOG_ORDER_NUMBER, 'debug','Calculate CheckSum for PaygateRequestId API - ENDS');
        return checkSum;
    } catch(error) {
        logger.writePaymentLog(LOG_ORDER_NUMBER, 'debug','Payment Flow - Check Sum Calculation - Error Caught - ' + error);
    }
}
/* Calculate CheckSum  */


/* Make Proper Error Response to Show in Logs */

var makeErrorResponse = (error) => {
    // var res = '{ statusCode: ' + error.statusCode + ', body: ' + JSON.stringify(error.body) + '}';
    return error;
}
/* Make Proper Error Response to Show in Logs */

/* Send Failure Response to User if there is some error before User is redirected to payment gateway */
var sendFailureBeforePayment = (req, res, cdrParams, err) => {
    logger.writePaymentLog(LOG_ORDER_NUMBER, 'debug','Payment Flow - SENDING FAILURE RESPONSE TO CLIENT BEFORE PAYMENT CALLED');
    if (req.body.TASK) {
        return new Promise( (resolve, reject) => {
            resolve(true);
        });
    } else {
        return res.redirect('/recharge/error');
        // return res.status(400).json({'statusCode': 'com101', 'statusMessage': 'Payment didn\'t happen, there was some error'});
    }
}
/* Send Failure Response to User if there is some error before User is redirected to payment gateway */

/* Send Failure Response to User if there is some error after Payment is done and redirected to our portal */
var sendFailureAfterPayment  = (req, res, cdrParams, err) => {
    if (req.body.TASK) {
        logger.writePaymentTaskLog(LOG_ORDER_NUMBER, 'debug','Payment Flow - SENDING FAILURE RESPONSE TO CLIENT AFTER PAYMENT - CALLED');
        return false;
    } else {
        logger.writePaymentLog(LOG_ORDER_NUMBER, 'debug','Payment Flow - SENDING FAILURE RESPONSE TO CLIENT AFTER PAYMENT - CALLED');
        return res.status(200).json({'statusCode': 'com102', 'statusMessage': 'Payment happened, there was some error'});
    }
}
/* Send Failure Response to User if there is some error after Payment is done and redirected to our portal */

/* Send Success Response to User before User is redirected to payment gateway */
var sendSuccessBeforePayment = (req, res, cdrParams) => {
    try{
        
        if (req.body.TASK) {
            logger.writePaymentTaskLog(LOG_ORDER_NUMBER, 'debug','Payment Flow - SEND SUCCESS RESPONSE TO CLIENT BEFORE PAYMENT CALLED');
            return true;
        } else {
            logger.writePaymentLog(LOG_ORDER_NUMBER, 'debug','Payment Flow - SEND SUCCESS RESPONSE TO CLIENT BEFORE PAYMENT CALLED');
            logger.writeLog('debug','Payment Flow - Response in JSON - ' + JSON.stringify(req.body));
            logger.writePaymentLog(LOG_ORDER_NUMBER, 'debug','Payment Flow - Response in JSON - ' + JSON.stringify(req.body));
            return res.status(200).json(req.body);
        }
    } catch(error) {
        logger.writePaymentLog(LOG_ORDER_NUMBER, 'debug','Payment Flow - SEND SUCCESS RESPONSE BEFORE PAYMENT - Error Caught - ' + error + + '\n' + error.stack);
    }
    
}
/* Send Success Response to User before User is redirected to payment gateway */

/* Send Success Response to User before User after payment is done and user id redirected to our portal */
var sendSuccessAfterPayment = (req, res, cdrParams) => {
    logger.writePaymentLog(LOG_ORDER_NUMBER, 'debug','Payment Flow - SEND SUCCESS RESPONSE TO CLIENT AFTER PAYMENT CALLED');
    if (req.body.TASK) {
        return true;
    } else {
        return res.status(200).json(req.body);
    }
}
/* Send Success Response to User before User after payment is done and user id redirected to our portal */

/* Give the details of the user to portal after he is redirected from payment gateway to our portal */
var getUserDetails = (req, res, cdrParams) => {
    logger.writePaymentLog(LOG_ORDER_NUMBER, 'debug', 'Giving Details to the User on Feedback Page - STARTS');
    logger.writePaymentLog(LOG_ORDER_NUMBER, 'debug', 'Request Body from Front End for Feedback Page - ' + JSON.stringify(req.body));
    var findPayload = {
        ORDER_NO: req.body.id
    };
    logger.writePaymentLog(LOG_ORDER_NUMBER, 'debug', 'Finding Details from DB for the ID received - Find Payload - ' + JSON.stringify(findPayload));
    mydb.findOne(dbName, paymentOpenTable, findPayload).then( response => {
        var succRes = {
            'status_code': 1,
            'status_message': 'Success',
            'transaction_id': req.body.transaction_id,
            'order_no': response.ORDER_NO
        };
        return res.status(200).json(succRes);
    }).catch(err => {
        var failRes = {
            'status_code': 1,
            'status_message': 'Failed to Fetch User Data'
        };
        return res.status(200).json(failRes);
    });
}
/* Give the details of the user to portal after he is redirected from payment gateway to our portal */

var getPaygateTransactionAmount = (amount) => {
    logger.writePaymentLog(LOG_ORDER_NUMBER, 'debug','Payment Flow - Getting Transaction for sending to Paygate - ' + parseFloat(amount) * 100.00);
    return parseFloat(amount) * 100.00;
}

var sendMail = function(req, res, cdrParams) {
    // logger.writePaymentLog(LOG_ORDER_NUMBER, 'debug','Payment Flow - Step 6 - Mail to User - STARTS');
    try {
        LOG_ORDER_NUMBER = req.body.ORDER_NO;
        var findQuery = {
            PAY_REQUEST_ID : req.body.PAY_REQUEST_ID
        };
        logger.writePaymentLog(LOG_ORDER_NUMBER, 'debug','Payment Flow - Step 6 - Mail to User - Setting DB Find Payload After Redirecting from PaymentGateway - ' + JSON.stringify(findQuery));
        mydb.findOne(dbName, paymentOpenTable, findQuery).then( response => {
            logger.writePaymentLog(LOG_ORDER_NUMBER, 'debug','Payment Flow - Step 6 - Mail to User - Getting Response from DB After Redirecting from PaymentGateway - ' + JSON.stringify(response));
            req.body.msisdn = response.MSISDN;
            req.body.amount = response.AMOUNT;
            req.body.soa_transaction_id = response.TRANSACTION_ID;
            req.body.vas_code = response.VAS_CODE;
            req.body.chargeable = response.CHARGEABLE;
            req.body.trans_type = response.TRANS_TYPE;
            req.body.reference = response.REFERENCE;
            req.body.pay_request_id = response.PAY_REQUEST_ID;
            req.body.order_no = response.ORDER_NO;
            req.body.retry = response.RETRY;
            /* Setting Mail Subject and Mail Body */
            var mailHeading = config.PAYMENT.MAIL_FAILURE_MESSAGE;
            var mailSubject = "Alert - MyMTN - Payment Transaction - Payment\'s Failing after 3 retries";
            var mailBody = "<html><head>" +
            "<img src='http://stage-1app.mtn.co.za/webaxn/header.png'  style='width:100%;height:5%/></head><body style='width:100%'><p>Dear <b>Customer</b>,</p><br/>" + 
            mailHeading + "<br/><br/><table border='1' style='margin-left:50px' ><tr><td>AMOUNT</td><td>R" + 
            response.AMOUNT + "</td></tr><tr><td>MTN TRANSACTION ID</td><td>" +
            req.body.TRANSACTION_ID + "</td></tr><tr><td>Pay RequestID</td><td>" +
            response.PAY_REQUEST_ID + "</td></tr><tr><td>Cell Number</td><td>" +
            response.MSISDN + "</td></tr><tr><td>Reason Description</td><td>"+
            mailDesc + "</td></tr></table><p>Regards,<br/><b>MyMTN</b><br/></body><footer><img src='http://stage-1app.mtn.co.za/webaxn/footer.png'  style='width:100%;height:10%'/></footer></html>";
            mailBody = encodeURIComponent(mailBody);

            /* Setting Mail Subject and Mail Body */
            const options = {
                method: 'GET',
                uri:  config.PAYMENT.WEBAXN_URL + 
                "GenericPlugin&Method=sendEmail" +
                "&username=" + mailUserName +
                "&password="+ mailPassword +
                "&to=" + myMailID +
                "&subject=" + mailSubject + 
                "&body="+ mailBody + 
                "&from=mymtnapp@mtn.co.za" +
                "&cc=" + mailCC +
                "&opco=sa",
                json: true,
                timeout: config.API_TIMEOUT,
            };
            logger.writePaymentLog(LOG_ORDER_NUMBER, 'debug','Payment Flow - Step 6 - Mail to User - Request Payload to WebAxn for Sending Mail - ' + JSON.stringify(response));
            request(options, function(error, response, body) {
            if(!error && response.statusCode == 200) {
                logger.writePaymentLog(LOG_ORDER_NUMBER, 'debug','Payment Flow - Step 6 - Email Sending Success from WebAxn - ' +  JSON.stringify(response));
                logger.writePaymentLog(LOG_ORDER_NUMBER, 'debug','Payment Flow - Step 6 - OUT');
            } else {
                logger.writePaymentLog(LOG_ORDER_NUMBER, 'debug','Payment Flow - Step 6 - Email Sending Failure from WebAxn - ' + utils.makeErrorResponse(response));
                logger.writePaymentLog(LOG_ORDER_NUMBER, 'debug','Payment Flow - Step 6 - Mail to User - ENDS');
            }
            });
        });
    } catch(err) {
        logger.writePaymentLog(LOG_ORDER_NUMBER, 'debug','Payment Flow - Step 6 - Mail to User - Error Caught - ' + err.stack);
        utils.sendFailureAfterPayment(req, res, cdrParams);
    }
    finally{
        // utils.sendFailureAfterPayment(req, res, cdrParams);
    }
}


module.exports = {
    checkSum: checkSum,
    makeErrorResponse: makeErrorResponse,
    sendFailureBeforePayment: sendFailureBeforePayment,
    sendFailureAfterPayment: sendFailureAfterPayment,
    sendSuccessBeforePayment: sendSuccessBeforePayment,
    sendSuccessAfterPayment: sendSuccessAfterPayment,
    getUserDetails: getUserDetails,
    getPaygateTransactionAmount: getPaygateTransactionAmount,
}