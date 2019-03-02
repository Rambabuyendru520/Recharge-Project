var rp = require('request-promise');
var logger = require('./logger');
var cdr = require('./cdr');
exports.send = (req, res, cdrParams, options) => {
  if(options.body) {
    console.log('REQUEST BODY: ' + JSON.stringify(options.body));
  }
	cdrParams.originIP = req.headers.origin;
  rp(options)
  .then(response => {
    if (options.plugin_type) {
      logger.writeBundleListLog('debug','SUCCESS RESPONSE - ' + JSON.stringify(response) + "\n");
    } else {
      logger.writeLog('debug','SUCCESS RESPONSE - ' + JSON.stringify(response) + "\n");
    }
    req.endtime = Date.now();
	// logger.writeActionCDR(req);
	cdrParams.output = response;
	cdrParams.statusMessage = "Success";
	cdrParams.statusCode = "200";
	// cdr.writeMiddlewareCDR(req, cdrParams);
    return res.status(200).json(response);
  })
  .catch(err => {
    console.log('FAILURE RESPONSE -  ' + JSON.stringify(err));
    logger.writeLog('debug','FAILURE RESPONSE - ' + JSON.stringify(err) + "\n");
    req.endtime = Date.now();
	// logger.writeActionCDR(req);
	cdrParams.output = err;
	cdrParams.statusMessage = "Failure";
	cdrParams.statusCode = "502";
	// cdr.writeMiddlewareCDR(req, cdrParams);
    return res.status(502).json({'StatusMessage': 'Bad Request'});
  });
}
