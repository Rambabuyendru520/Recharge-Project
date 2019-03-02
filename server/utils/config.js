var path = require('path');
var serverConfig = require('../config');

exports.loggerConfig = {
  defaultLang: "en",
  STORAGE: {
    namespace: 'webselfcare',
    tid: 'tid',
    sessionid: 'sessionid',
    ip: 'ip'
  },
  LOG: {
    filename:  serverConfig.RECHARGES_PATH + 'logs/plugin/online-recharge1.log',
    datePattern: 'YYYY-MM-DD',
    prepend: false,
    level: 'debug'
  },
  PAYMENT_LOG: {
    file: {
      filename: serverConfig.RECHARGES_PATH +'logs/payment/payment1.log',
      datePattern: 'YYYY-MM-DD',
      prepend: false,
      level: 'debug',
    },
    console: {
      level: 'debug',
      handleExceptions: true,
      json: true,
      colorize: true
    }
   
  },
  PAYMENT_TASK_LOG: {
    file: {
      filename: serverConfig.RECHARGES_PATH + 'logs/paymentTask/paymentTask1.log',
      datePattern: 'YYYY-MM-DD',
      prepend: false,
      level: 'debug',
    },
    console: {
      level: 'debug',
      handleExceptions: true,
      json: true,
      colorize: true
    }
   
  },
  BUNDLE_LIST_LOG: {
    file: {
      filename: serverConfig.RECHARGES_PATH + 'logs/plugin/bundle-list1.log',
      datePattern: 'YYYY-MM-DD',
      prepend: false,
      level: 'debug',
    },
    console: {
      level: 'debug',
      handleExceptions: true,
      json: true,
      colorize: true
    }
   
  },
  CDR: {
    filename: './cdrs/webselfcare.cdr',
    datePattern: 'YYYY-MM-DD',
    prepend: false
  },
  USERCDR: {
    filename: './cdrs/useractivity.cdr',
    datePattern: 'YYYY-MM-DD',
    prepend: false
  },
  DB: {
    url: "mongodb://127.0.0.1:27017/sea_recharges" ,
    connectionOptions: {
      server: {
        poolSize: 100,
        socketOptions: {
          autoReconnect: true,
          connectTimeoutMS: 30000,
          socketTimeoutMS: 30000,
          keepAlive: 120
        },
        reconnectTries: 30,
        reconnectInterval: 1000,
        ha: false,
        haInterval: 10000
      },
      replicaSet: null
    }
  },
  SESSION: {
    name: 'sessionId',
    secret: 'webselfcare',
    saveUninitialized: true,
    resave: true,
    cookie: {
      maxAge: 1800000,
      httpOnly: true
	  //secure: false
    },
    autoRemove: "interval",
    autoRemoveInterval: 60 //In minutes
  }
}

exports.cdrAngularConfig = {
	filename: serverConfig.RECHARGES_PATH + 'cdrs/angularCDR1.cdr',
	datePattern: 'YYYY-MM-DD',
	prepend: false
};

exports.cdrMiddlewareConfig = {
	filename: serverConfig.RECHARGES_PATH + 'cdrs/middlewareCDR.cdr',
	datePattern: 'YYYY-MM-DD',
	prepend: false
};
