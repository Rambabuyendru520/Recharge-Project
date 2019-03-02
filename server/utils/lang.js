var i18n = require('i18next');
var FilesystemBackend = require('i18next-node-fs-backend');
var middleware = require('i18next-express-middleware');
var config = require('./config');
var logger = require('./logger');
var path = require('path');
var loadPath = path.join(__dirname, '../locales/{{lng}}/{{ns}}.json');

var langDetector = new middleware.LanguageDetector();
var options = {
	order: ['session'],
	lookupSession: 'lang',
	caches: true
};
langDetector.init(options);

exports.initLang = function() {
	i18n.use(FilesystemBackend)
	.use(langDetector)
	.init({
		lng: config.defaultLang,
		preload: ['en'],
		supportedLngs: ['en'],
		fallbackLng: config.defaultLang,
		saveMissing: true,
		detectLngFromPath: false,
		useCookie: true,
		detectLngFromHeaders: false,
		backend: {
			loadPath: loadPath
		},
		compatibilityJSON: "v2",
		debug: false
	});

	return i18n;
}

exports.addLangMiddleware = function(app) {
	app.use(middleware.handle(i18n));
}

exports.setLanguage = function(req, lang, callback) {
	if (req.session) {
		req.session.lang = lang;
	}

	req.i18n.changeLanguage(lang);

	i18n.changeLanguage(lang, function(err, t) {
		if (err) {
			logger.writeLog("warn", "Could not change language - " + err);
			callback(err);
		} else {
			logger.writeLog("debug", "Language changed to - " + lang);
			callback(null);
		}
	});
}
