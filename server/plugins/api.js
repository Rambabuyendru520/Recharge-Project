var express = require('express');
var router = express.Router();
var logger = require('../utils/logger');
var cdr = require('../utils/cdr');
var dateFormats = require('../utils/dateformats');
var sha256 = require('js-sha256');
var config = require('../config');
var payment = require('../payment/payment');
var logger = require('../utils/logger');
var payment_utils = require('../payment/utils');
var bundles = require('../plugins/bundles');
var feedback = require('../plugins/feedback');

router.get('/', function(req, res, next) {
    res.send("App Middleware");
});
router.post('/angularCDR',angularCDR);
router.get('/savePDF', savePDF);
router.post('/getBundlesList', getBundles);
router.post('/paygateRedirect', startPayment);
router.post('/paymentCallback', paymentCallback);
router.post('/paymentReturn', paymentReturn);
router.post('/getBackDetails', getBackDetails);
router.post('/getValidateCard', getValidateCard);
router.post('/sendFeedback', sendFeedback);

var aCDRParams = {};
aCDRParams.transStartTime = dateFormats.ddMMyyyyhhmmss(0);
var LOG_ORDER_NUMBER;
function angularCDR(req, res, next){
  if (req.headers.authorization && req.headers.authorization === sha256(config.AUTH_KEY)) {
		cdr.writeAngularCDR(req, res, req.body);
  } else {
	  	console.log('CDR doesn\'t match');
		res.status(403).json({'statusMessage': 'BadRequest'});
  }
}

function getBundles(req, res, next) {
	var returnLink = config.CONNECTION + '://' + config.IP + ':' + config.PORT + '/recharge/forbidden';
	if(req.headers.authorization && req.headers.authorization === sha256(config.AUTH_KEY)) {
		bundles.getBundleDetails(req, res, aCDRParams);
	} else {
		res.status(403).json({'statusMessage': 'BadRequest'});
	}
}

function getValidateCard(req, res, next) {
	if (req.headers.authorization) {
		if(req.headers.authorization === sha256(config.AUTH_KEY)) {
			bundles.getValidateCardDetails(req, res , aCDRParams);
		}
	}
}

function startPayment(req, res, next) {
	try{
		LOG_ORDER_NUMBER = req.body.order_no;
		logger.writePaymentLog(LOG_ORDER_NUMBER, 'debug','Request Payload from Front End - ' + JSON.stringify(req.body));
		payment.startPaymentFlow(1, req, res);
	}
	catch(error){
	}
	
}


function savePDF(req, res, next) {
	logger.writeLog('Inside Download PDF');
	var file = __dirname + '/../Terms.pdf';
	  res.download(file);
}

function paymentCallback(req, res, next) {
	console.log('Inside Payment Payment CallBack - '+ JSON.stringify(req.body));
	console.log('Inside Payment Payment CallBack - '+ JSON.stringify(req.query));
	logger.writePaymentLog(LOG_ORDER_NUMBER, 'debug', 'PAYGATE CALLED BACK WITH \'CALLBACK URL\' WE PASSED');
	logger.writePaymentLog(LOG_ORDER_NUMBER, 'debug', 'POST DATA Received from Paygate CallBack - ' + JSON.stringify(req.query));
	req.body = req.query;
	payment.startPaymentFlow(6, req, res);
}

function paymentReturn(req, res, next) {
	logger.writePaymentLog(LOG_ORDER_NUMBER, 'debug', 'PAYGATE CALLED BACK WITH \'RETURN URL\' WE PASSED');
	logger.writePaymentLog(LOG_ORDER_NUMBER, 'debug', 'POST DATA Received from Paygate Return - ' + JSON.stringify(req.body));
	if(req.body.TRANSACTION_STATUS === '1' || req.body.TRANSACTION_STATUS === 1
	 	|| req.body.TRANSACTION_STATUS == 1 || req.body.TRANSACTION_STATUS === '1') {
		returnLink ='/recharge/feedback';
	} else {
		returnLink = '/recharge/error/payment';
	}
	console.log('return Link - ' + returnLink);
	res.redirect(returnLink);
}

function getBackDetails(req, res, next) {
	payment_utils.getUserDetails(req, res, aCDRParams);
}

function sendFeedback(req, res, next) {
	console.log('Inside feedback');
	if (req.headers.authorization) {
		if(req.headers.authorization === sha256(config.AUTH_KEY)) {
			console.log('Validate Card Matches');
			feedback.sendFeedback(req, res, aCDRParams);
		}
	}	
	
}

module.exports = router;

function verifyAPIAuth(req, res, next) {
	if (req.session && req.session.isLoggedIn) {
		next();
	} else {
		var err = new Error("Unauthorized");
		err.status = 401;
		next(err);
	}
}