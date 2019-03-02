var config = require('../config');
var request = require('../utils/request');
var rp = require('request-promise');
var logger = require('../utils/logger');
var sha256 = require('js-sha256');
var mydb = require('../payment/mydb');
exports.sendFeedback = (req, res, cdrParams) => {
  try{
    logger.writeLog('debug', 'Send Feedback for the User - STARTS');
    var findPayload = {
      ORDER_NO: req.body.order_no
    };
    var finalResult;
    logger.writeLog('debug', 'Send Feedback for the User - Request Body - ' + JSON.stringify(req.body));
    logger.writeLog('debug', 'Find Payload to fetch the details of the user - ' + JSON.stringify(findPayload));
    mydb.findOne(config.PAYMENT.DB_NAME, config.PAYMENT.PAYMENT_CLOSE_TABLE, findPayload).then( findRes1 => {
      finalResult = findRes1;
      logger.writeLog('debug','Find Result - ' + JSON.stringify(findRes1));
      if(!req.body.facing_name) {
        req.body.facing_name = 'Airtime';
      }
      const payload = 
      { "arg1": 
          {
            'atg-rest-class-type' : 'za.co.mtn.store.service.v1.bean.MTNVasDataRequestBean',
            'transaction_id': logger.getTransactionID(),
            'msisdn': finalResult.MSISDN,
            'vas_code': req.body.vas_code,
            'vas_customer_facing_name': req.body.facing_name,
            'rating': req.body.rating,
            'feedback': req.body.feedback,
            'source_system': config.ATG_SOURCE_SYS,
            'ecommerce_reference_num': findPayload.ORDER_NO,
            'payment_gateway_ref_num': finalResult.PAY_REQUEST_ID
          }
      };
      const options = {
        method: 'POST',
        uri:  config.ATG_REST_URL + 'card_feedback',
        headers: {
          "Authorization": "Basic " + config.ATG_REST_AUTH,
          "Accept": "application/json",
          "Content-Type": "application/json" 
      },
        body: payload,
        json: true
      }
      logger.writeLog('debug', 'Request URL for Card Feedback - ' + options.uri);  
      logger.writeLog('debug', 'Request Payload for Card Feedback - ' + JSON.stringify(payload));
      request.send(req, res, cdrParams, options);
    })
    .catch( eRes => {
      mydb.findOne(config.PAYMENT.DB_NAME, config.PAYMENT.PAYMENT_OPEN_TABLE, findPayload).then(findRes2 => {
        finalResult = findRes2;
        logger.writeLog('debug','Find Result2 - ' + JSON.stringify(findRes2));
        if(!req.body.facing_name) {
          req.body.facing_name = 'Airtime';
        }
        const payload = 
        { "arg1": 
            {
              'atg-rest-class-type' : 'za.co.mtn.store.service.v1.bean.MTNVasDataRequestBean',
              'transaction_id': logger.getTransactionID(),
              'msisdn': finalResult.MSISDN,
              'vas_code': req.body.vas_code,
              'vas_customer_facing_name': req.body.facing_name,
              'rating': req.body.rating,
              'feedback': req.body.feedback,
              'source_system': config.ATG_SOURCE_SYS,
              'ecommerce_reference_num': findPayload.ORDER_NO,
              'payment_gateway_ref_num': finalResult.PAY_REQUEST_ID
            }
        };
        const options = {
          method: 'POST',
          uri:  config.ATG_REST_URL + 'card_feedback',
          headers: {
            "Authorization": "Basic " + config.ATG_REST_AUTH,
            "Accept": "application/json",
            "Content-Type": "application/json" 
        },
          body: payload,
          json: true
        };
        logger.writeLog('debug', 'Request URL for Card Feedback - ' + options.uri);  
        logger.writeLog('debug', 'Request Payload for Card Feedback - ' + JSON.stringify(payload));
        request.send(req, res, cdrParams, options); 
      }); 
    });
  }
    catch(err) {
      logger.writeLog('Error in Feedback API - ' + err.stack);  
    }
}
