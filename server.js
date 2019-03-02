const express = require('express');
const path = require('path');
const http = require('http');
const helmet = require('helmet');
const compression = require('compression');
const bodyParser = require('body-parser');
const validator = require('express-validator');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
var cls = require('continuation-local-storage');
const logger = require('./server/utils/logger');
const serverConfig = require('./server/config');
const archive_plugin = require('./server/scripts/archive_plugin');
const config = require('./server/utils/config').loggerConfig;
const api = require('./server/plugins/api');
const https = require('https'),
			fs = require('fs');

const app = express();
var private_key = 'server/certificates/' + serverConfig.CERT_NAME + '.key';
var certifcate = 'server/certificates/' + serverConfig.CERT_NAME + '.cert';
var httpsOptions = {
	key: fs.readFileSync(private_key),
	cert: fs.readFileSync(certifcate),
	requestCert: false,
	rejectUnauthorized: false
}

var  whitelistedOrigins = serverConfig.WHITELISTED_HOSTS;

app.use(helmet());
app.use(compression());
app.use(cookieParser());
cls.createNamespace(config.STORAGE.namespace);
app.use((req, res, next) => {
		/* if (whitelistedOrigins.indexOf(req.headers.host) !== -1) {
			console.log("inside allowed host - " + req.headers.host + " - is whitelisted");
		} else {
			console.log("inside disallowed host - " + req.headers.host + " - is not whitelisted - ");
			res.sendFile(path.join(__dirname, 'src/forbidden.html'));
		}	 */
	  var start = new Date();
	  req.tid = "";
	  if(process.env.NODEID){
		req.tid = [req.tid, process.env.NODEID].join("");
	  }
	  req.tid = [req.tid, Date.now()].join("");
	  req.starttime = Date.now();
	  req.status = 200;
	  req.cdr = new Object;
	  res.cookie('agentName', 'User Agent');
	  res.header('Access-Control-Allow-Origin', '*');
	  res.header('Access-Control-Allow-Headers','X-Requested-With, Content-Type, Authorization');
	  res.header('Access-Control-Allow-Methods','GET, POST');
	  
	  var namespace = cls.getNamespace(config.STORAGE.namespace);
	  namespace.bindEmitter(req);
	  namespace.bindEmitter(res);
	  namespace.run(() => {
		next();
	  });
	  res.on('finish', () => {
		const end = new Date();
	  });
});

	
config.SESSION.store = new MongoStore({url: config.DB.url});
// app.use(session(config.SESSION));
app.use(session({
	secret: 'It is a secret',
	saveUninitialized: true, // don't create session until something stored
    resave: true, //don't save session if unmodified
    maxAge: new Date(Date.now() + 3600000),
    store: new MongoStore({url: config.DB.url})
}));


app.use(validator());

app.use((req, res, next) => {
  for(var item in req.body){
    req.sanitize(item).escape();
  }
  next();
});

app.use((req, res, next) => {
  req.session._garbage = Date();
  req.session.touch();
  next();
});

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());


app.use(serverConfig.PLUGIN_URL, api);


app.use(express.static(path.join(__dirname, 'dist')));

app.get('/recharge/forbidden', (req, res) => {
	res.sendFile(path.join(__dirname, 'src/forbidden.html'));
});

app.get('/recharge/*', (req, res) => {
	res.sendFile(path.join(__dirname, 'dist/recharge/index.html'));
});

app.use((req, res, next) => {
  var err = new Error('Page Not Found');
  err.status = 404;
  next(err);
});

app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = process.env.ENV == "dev" ? err : {};
  req.status = err.status || 500;
  res.status(err.status || 500);
  res.send(res.locals.error);
});

const port = serverConfig.PORT || '3000';
app.set('port', port);

if(serverConfig.CONNECTION === 'https' || serverConfig.CONNECTION === https) {
		https.createServer(httpsOptions, app).listen(port, function(){ // HTTPS Server
    	console.log('RECHARGES ' +serverConfig.CONNECTION +' Server Running in Port ' + port);
	});	// HTTPS Server
} else {
	http.createServer(app).listen(port, () => {
		console.log('RECHARGES '+ serverConfig.CONNECTION +' Server Running in Port ' + port);
	});  // HTTP Server
	
}

/* Payment Scripts */

var cron = require('node-cron');
var paymentTask = require('./server/payment/paymentTask');
var bundleTask = require('./server/payment/bundleTask');

cron.schedule('0,30 * * * *' , () => {
	console.log('Node Cron Job Running for payment ');
	 paymentTask.startPaymentTask(1);
});

cron.schedule('15,45 * * * *' , () => {
	console.log('Node Cron Job Running for bundle');
	bundleTask.startBundleTask(1);
});


/* Payment Scripts */



/* Bundle List Arhive Scripts */

cron.schedule('1 0 * * *' , () => {
	console.log('Node Cron Job Running for plugin archive');
	archive_plugin.archivePluginLog();
});

/* Bundle List Arhive Scripts */


