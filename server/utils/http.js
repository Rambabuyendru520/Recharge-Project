var url = require('url');
var http = require('http');
var https = require('https');
var logger = require('../utils/logger');
// var config = require('../config/config');

exports.sendGetRequest = function(url, headers, callback) {
	sendRequest(url, 'GET', headers, null, callback);
}

exports.sendPostRequest = function(url, headers, postdata, callback) {
	sendRequest(url, 'POST', headers, postdata, callback);
}

exports.sendHttpGETRequest = function(url, postData) {
  var xmlhttp = null;
  var method = "GET";
  var jsonObj = null;
  if (postData != null) method = "POST";
  if (null == xmlhttp) {
    xmlhttp = new XMLHttpRequest();
  }
  xmlhttp.onreadystatechange = function () {
    if (xmlhttp.readyState == 4) {
      if (xmlhttp.status == 200) {
        jsonObj = xmlhttp.responseText;
      }
    }
  };
  xmlhttp.open(method, url, false);
  xmlhttp.send(postData);
  return jsonObj;
}

exports.sendJSONGetRequest = function(url, headers, callback) {
	sendRequest(url, 'GET', headers, null, function(err, res) {
		if (err) {
			callback(err);
		} else {
			if (res && res.body) {
				try {
					res.json = JSON.parse(res.body);
					callback(null, res);
				} catch (ex) {
					logger.writeLog("warn", "sendJSONGetRequest: JSON parsing failed - " + ex);
					callback(ex);
				}
			} else {
				callback(new Error("Response not received"));
			}
		}
	});
};

exports.sendJSONPostRequest = function(url, headers, postdata, callback) {
	sendRequest(url, 'POST', headers, postdata, function(err, res) {
		if (err) {
			callback(err);
		} else {
			if (res && res.body) {
				try {
					res.json = JSON.parse(res.body);
					callback(null, res);
				} catch (ex) {
					logger.writeLog("warn", "sendJSONPostRequest: JSON parsing failed - " + ex);
					callback(ex);
				}
			} else {
				callback(new Error("Response not received"));
			}
		}
	});
}

function sendRequest(requestURL, method, headers, postdata, callback) {
    var logURL = requestURL;
    if(logURL.indexOf("?") != -1)
    {
        logURL = logURL.substring(logURL.indexOf("?")+1);
    }
	logger.writeLog("info", "sendRequest: url - " + logURL);

	var parsedURL = url.parse(requestURL, false, true);
	if (parsedURL) {
		var transport = http;
		if (parsedURL.protocol == "https") {
			transport = https;
		}

		var options = parsedURL;
		options.method = method;
		options.headers = headers;
		options.timeout = 5000;

		var req = transport.request(options, function(res) {
			var body = '';

			res.on('data', function(chunk) {
				body += chunk;
			});

			res.on('end', function() {
				logger.writeLog("info", "sendRequest: Status - " + res.statusCode + ", response - " + body);
				var httpRes = new Object;
				httpRes.status = res.statusCode;
				httpRes.body = body;
				logger.writeLog("info", "sendRequest: Status - " + res.statusCode + ", response - " + JSON.stringify(httpRes.body));
				callback(null, httpRes);
			});
		}).on('error', function(err) {
			callback(err);
		});

		if (postdata) {
			req.write(postdata);
		}
		req.end();
	} else {
		logger.writeLog("warn", "sendRequest: URL parsing failed");
		callback(new Error("Malformed URL"));
	}
}
