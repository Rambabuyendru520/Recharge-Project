var exports = module.exports = {} ;

var winston = require('winston');
require('winston-daily-rotate-file');

var configPath = require('./config');
var path = require('path');
var fs = require('fs');
var parser = require('ua-parser-js');
var dateFormats = require('../utils/dateformats');

function createDir(dirname) {
	if (!fs.existsSync(dirname)){
		fs.mkdirSync(dirname);
	}
}

//Middleware CDRs
var cdrMiddlewaredir = path.dirname(configPath.cdrMiddlewareConfig.filename);
if (cdrMiddlewaredir) {
	// createDir(cdrMiddlewaredir);
}

configPath.cdrMiddlewareConfig.formatter = function(options) {
	return options.message;
};
configPath.cdrMiddlewareConfig.level = 'debug';
configPath.cdrMiddlewareConfig.json = false;

var cdrMiddlewareLogger = new (winston.Logger)({
	transports: [
		new winston.transports.DailyRotateFile(configPath.cdrMiddlewareConfig)
	]
});

exports.writeMiddlewareCDR = function (req, cdrparams) {
    cdrparams.msisdn = req.body.msisdn;
	cdrparams.node = req.connection.remoteAddress;
	var sub_type = "";
	// console.log("cdrparams------------------------------------" + JSON.stringify(cdrparams));
    if (cdrparams.output && cdrparams.output.subattr && cdrparams.output.subattr.SUB_TYPE) {
		cdrparams.sub_type = cdrparams.output.subattr.SUB_TYPE;
	} else {
		cdrparams.sub_type = req.body.sub_type;
	}
    cdrparams.userName = req.body.msisdn;
    // cdrparams.agentName = "NA"; // headers from SSO
    cdrparams.role = req.body.role;
    // cdrparams.originIP = "NA"; // headers from SSO
    cdrparams.sessionID = "NA";
	// console.log("sessionId---" + JSON.stringify(req.session));
    var UserAgent = parser(req.get("User-Agent"));
    cdrparams.browserVersion = UserAgent.browser.name + "-" + UserAgent.browser.version;
    cdrparams.transEndTime = dateFormats.ddMMyyyyhhmmss(0);

	var cdr = cdrparams.transStartTime;
    cdr += "|" + cdrparams.transEndTime;
    cdr += "|" + cdrparams.node;
    cdr += "|" + cdrparams.sessionID
    cdr += "|" + cdrparams.userName;
    cdr += "|" + cdrparams.msisdn;
	cdr += "|" + cdrparams.sub_type;
    cdr += "|" + cdrparams.originIP;
    cdr += "|" + cdrparams.agentName;
    cdr += "|" + cdrparams.role;
    cdr += "|" + cdrparams.browserVersion;
    cdr += "|" + cdrparams.activityCategory;
	cdr += "|" + cdrparams.subCategory;
	cdr += "|" + cdrparams.component;
	cdr += "|" + cdrparams.input;
	cdr += "|" + cdrparams.output;
	cdr += "|" + cdrparams.offerCode;
	cdr += "|" + cdrparams.amount;
	cdr += "|" + cdrparams.statusCode;
	cdr += "|" + cdrparams.statusMessage;
    cdr += "|" + "param1";
    cdr += "|" + "param2";
    cdr += "|" + "param3";
    cdr += "|" + "param4";
    cdr += "|" + "param5";

	// cdrMiddlewareLogger.debug(cdr);
}

//Angular CDRs
var cdrAngulardir = path.dirname(configPath.cdrAngularConfig.filename);
if (cdrAngulardir) {
	createDir(cdrAngulardir);
}

configPath.cdrAngularConfig.formatter = function(options) {
	return options.message;
};
configPath.cdrAngularConfig.level = 'debug';
configPath.cdrAngularConfig.json = false;

var cdrAngularLogger = new (winston.Logger)({
	transports: [
		new winston.transports.DailyRotateFile(configPath.cdrAngularConfig)
	]
});

exports.writeAngularCDR = function (req, res, cdrparams) {
    var UserAgent = parser(req.get("User-Agent"));
    cdrparams.browserVersion = UserAgent.browser.name + "-" + UserAgent.browser.version;
	cdrparams.transEndTime = dateFormats.ddMMyyyyhhmmss(0);
	cdrparams.originIP = (req.headers['x-forwarded-for'] ||
							req.connection.remoteAddress ||
							req.socket.remoteAddress ||
							req.connection.socket.remoteAddress).split(",")[0];
	cdrparams.sessionID = req.session.id;
	var cdr = cdrparams.transStartTime;
    cdr += "|" + cdrparams.transEndTime;
    cdr += "|" + cdrparams.sessionID
    cdr += "|" + cdrparams.msisdn;
    cdr += "|" + cdrparams.originIP.substring(7);
    cdr += "|" + cdrparams.browserVersion;
    cdr += "|" + cdrparams.activityCategory;
	cdr += "|" + cdrparams.subCategory;
	cdrAngularLogger.debug(cdr);
	return res.status(200).json({'StatusMessage': 'Success'});
}

