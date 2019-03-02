var request = require('../utils/request');
var logger = require('../utils/logger');
var sha256 = require('js-sha256');
var config = require('../config');

exports.getBundleDetails = (req, res, cdrParams) => {
	cdrParams.activityCategory = "Bundle";
    cdrParams.subCategory = "GetBundleList";
    cdrParams.component = "GetBundleList";
    cdrParams.offerCode = "NA";
    cdrParams.amount = "NA";
	const options = {
        plugin_type: 'bundle',
        method: 'GET',
        uri: config.ATG_REST_URL_V2 + "cardVas?arg1="+ logger.getTransactionID() +"&arg2=Portal&arg3=Self Service&atg-rest-depth=2&atg-rest-http-method=POST&atg-rest-method=(Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;)Lza/co/mtn/store/service/v2/bean/MTNRestOutputBean",
        headers: {
            "Authorization": "Basic " + config.ATG_REST_AUTH,
            "Accept": "application/json",
            "Content-Type": "application/json" 
        },
        json: true
    };
    logger.writeBundleListLog('debug', 'Request for GetBundlesList - ' + options.uri);
    request.send(req, res, cdrParams, options);
}

exports.getValidateCardDetails = (req, res, cdrParams) => {
	  cdrParams.activityCategory = "Bundle";
    cdrParams.subCategory = "GetValidateCard";
    cdrParams.component = "GetValidateCard";
    cdrParams.offerCode = "NA";
    cdrParams.amount = "NA";
    let payload = '';
    if (req.body.airtime_value) {
        payload = { 
            "arg1" :{
                "atg-rest-class-type" : config.ATG_REST_CLASS_TYPE,
                "transaction_id" : logger.getTransactionID(),
                "msisdn" : req.body.msisdn,
                "vas_code" : req.body.vas_code,
                "airtime_value": req.body.airtime_value,
                "source_system" : config.ATG_SOURCE_SYS,
          }
      };
    } else {
        payload = { 
            "arg1" :{
                "atg-rest-class-type" : config.ATG_REST_CLASS_TYPE,
                "transaction_id" : logger.getTransactionID(),
                "msisdn" : req.body.msisdn,
                "vas_code" : req.body.vas_code,
                "source_system" : config.ATG_SOURCE_SYS,
          }
      };
    }
	  
	const options = {
      method: 'POST',
      uri:  config.ATG_REST_URL + "validate_card_vas",
      headers: {
          "Authorization": "Basic " + config.ATG_REST_AUTH,
          "Accept": "application/json",
          "Content-Type": "application/json" 
      },
      body: payload,
      json: true
  };
  logger.writeLog('debug', 'Request URL for Validate Card - ' + options.uri);
  logger.writeLog('debug', 'Request Payload for Validate Card - ' + JSON.stringify(payload));
 request.send(req, res, cdrParams, options);
};
