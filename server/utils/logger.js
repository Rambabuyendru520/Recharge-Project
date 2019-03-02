var winston = require('winston');
require('winston-daily-rotate-file');

var config = require('./config').loggerConfig;
var path = require('path');
var fs = require('fs');

var cls = require('continuation-local-storage');

var parser = require('ua-parser-js');
var dateformat = require('./dateformats');

function createDir(dirname) {
	if (!fs.existsSync(dirname)){
		fs.mkdirSync(dirname);
	}
}

var logdir = path.dirname(config.LOG.filename);
if (logdir) {
	createDir(logdir);
}
var paymentlogdir = path.dirname(config.PAYMENT_LOG.file.filename);
if (paymentlogdir) {
	createDir(paymentlogdir);
}
var paymentTasklogdir = path.dirname(config.PAYMENT_TASK_LOG.file.filename);
if (paymentTasklogdir) {
	createDir(paymentTasklogdir);
}
var bundleListlogdir = path.dirname(config.BUNDLE_LIST_LOG.file.filename);
if (bundleListlogdir) {
	createDir(bundleListlogdir);
}
var cdrdir = path.dirname(config.CDR.filename);
if (cdrdir) {
	createDir(cdrdir);
}

config.LOG.formatter = function(options) {
	return options.level + "|" + options.message;
};
config.LOG.json = false;

config.PAYMENT_LOG.formatter = function(options) {
	return options.level + "|" + options.message;
};
config.PAYMENT_LOG.json = false;

var logger = new (winston.Logger)({
	transports: [
		new winston.transports.DailyRotateFile(config.LOG)
	]
});
const myCustomLevels = {
	levels: {
	  debug: 0,
	  warn: 1,
	  baz: 2,
	  foobar: 3
	},
	colors: {
	  debug: 'white',
	  warn: 'green',
	  baz: 'yellow',
	  foobar: 'red'
	}
  };
var paymentLogger = new (winston.Logger)({
	transports: [
		new winston.transports.DailyRotateFile(config.PAYMENT_LOG.file),
	],
});
var paymentTaskLogger = new (winston.Logger)({
	transports: [
		new winston.transports.DailyRotateFile(config.PAYMENT_TASK_LOG.file),
	],
});

var bundleListLogger = new (winston.Logger)({
	transports: [
		new winston.transports.DailyRotateFile(config.BUNDLE_LIST_LOG.file),
	],
})

config.CDR.formatter = function(options) {
	return options.message;
};
config.CDR.level = 'debug';
config.CDR.json = false;

var cdrLogger = new (winston.Logger)({
	transports: [
		new winston.transports.DailyRotateFile(config.CDR)
	]
});

config.USERCDR.formatter = function(options) {
	return options.message;
};
config.USERCDR.level = 'debug';
config.USERCDR.json = false;

var userCDRLogger = new (winston.Logger)({
	transports: [
		new winston.transports.DailyRotateFile(config.USERCDR)
	]
});

exports.writeLog = function(level, message) {
	var log = dateformat.getLoggerDate() + "|";

	var namespace = cls.getNamespace(config.STORAGE.namespace);
	if (namespace) {
		var sessionID = namespace.get(config.STORAGE.sessionid);

		var sidAdded = false;
		if (sessionID) {
			log += sessionID;
			sidAdded = true;
		}

		var tid = namespace.get(config.STORAGE.tid);
		if (tid) {
			if (sidAdded) {
				log += " ";
			}
			log += tid;
		}
	}

	log += "|" + message;

	logger.log(level, log);
};

exports.writePaymentLog = function(order_no, level, message) {
	var log = dateformat.getLoggerDate() + "|";

	var namespace = cls.getNamespace(config.STORAGE.namespace);
	if (namespace) {
		var sessionID = namespace.get(config.STORAGE.sessionid);

		var sidAdded = false;
		if (sessionID) {
			log += sessionID;
			sidAdded = true;
		}

		var tid = namespace.get(config.STORAGE.tid);
		if (tid) {
			if (sidAdded) {
				log += " ";
			}
			log += tid;
		}
	}
	log += "| " + order_no + " | " +message;
	paymentLogger.log(level, log);
};
exports.writePaymentTaskLog = function(order_no, level, message) {
	var log = dateformat.getLoggerDate() + "|";

	var namespace = cls.getNamespace(config.STORAGE.namespace);
	if (namespace) {
		var sessionID = namespace.get(config.STORAGE.sessionid);

		var sidAdded = false;
		if (sessionID) {
			log += sessionID;
			sidAdded = true;
		}

		var tid = namespace.get(config.STORAGE.tid);
		if (tid) {
			if (sidAdded) {
				log += " ";
			}
			log += tid;
		}
	}
	log += "| " + order_no + " | " +message;
	paymentTaskLogger.log(level, log);
};

exports.writeBundleListLog = function(level, message) {
	var log = dateformat.getLoggerDate() + "|";

	var namespace = cls.getNamespace(config.STORAGE.namespace);
	if (namespace) {
		var sessionID = namespace.get(config.STORAGE.sessionid);

		var sidAdded = false;
		if (sessionID) {
			log += sessionID;
			sidAdded = true;
		}

		var tid = namespace.get(config.STORAGE.tid);
		if (tid) {
			if (sidAdded) {
				log += " ";
			}
			log += tid;
		}
	}

	log += "|" + message;

	bundleListLogger.log(level, log);
};


exports.writeCDR = function(startTime, endTime, req) {

	var cdr = startTime.toJSON() + "|";
	if (req.session && req.session.id) {
		cdr += req.session.id;
	}

	cdr += "|";

	if (req.session && req.session.msisdn) {
		cdr += req.session.msisdn;
	}

	cdr += "|";

	if (req.session && req.session.lang) {
		cdr += req.session.lang;
	}

	cdr += "|";

	if (req.routeName) {
		cdr += req.routeName;
	}

	cdr += "|" + req.method + "|" + req.originalUrl + "|";

	if (req.status) {
		cdr += req.status;
	}

	cdr += "|";

	if (req.cdr.param1) {
		cdr += req.cdr.param1;
	}

	cdr += "|";

	if (req.cdr.param2) {
		cdr += req.cdr.param2;
	}

	cdr += "|";

	if (req.cdr.param3) {
		cdr += req.cdr.param3;
	}

	cdr += "|";

	if (req.cdr.param4) {
		cdr += req.cdr.param4;
	}

	cdr += "|";

	if (req.cdr.param5) {
		cdr += req.cdr.param5;
	}

	cdr += "|";

	if (req.tid) {
		cdr += req.tid;
	}

	cdr += "|";
	var UserAgent = parser(req.get("User-Agent"));
	cdr += UserAgent.os.name + "-" + UserAgent.os.version;
	cdr += "|";
	cdr += UserAgent.browser.name + "-" + UserAgent.browser.version;

	cdr += "|" + endTime.toJSON();

	cdrLogger.debug(cdr);
};

exports.writeActionCDR = function(req) {
	var namespace = cls.getNamespace(config.STORAGE.namespace);
	var cdr = req.starttime;
	cdr += "|" + req.msisdn;
	cdr += "|" + req.apiStatus;
	cdr += "|" + req.endtime;
	userCDRLogger.debug(cdr);
}

exports.getTransactionID = function(req) {
  // var transID = Math.floor(Date.now() / 1000);
  // var randomNumber = Math.floor(100000000 + Math.random() * 900000000);
  return new Date().getTime() + Math.floor(100000000 + Math.random() * 900000000);;
}
exports.getTransactionDate = function getTransactionDate(){
	var d = new Date();
	return unified(d.getFullYear(), 0) + '-' + unified(d.getMonth(), 1) + '-' + unified(d.getDate(), 0)
		   + ' ' + unified(d.getHours(), 0) + ':' + unified(d.getMinutes(), 0) + ':' + unified(d.getSeconds(), 0);
  }
function unified(num, add) {
	num += add;
	if (num <= 9) {
	  num = ('0' + num).toString();
	}
	return num;
  }