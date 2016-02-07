"use strict";

var fs = require('fs');

module.exports = (htmlPath, config) => 
{
	var headBefore = "<!DOCTYPE html><html><head>";
	var bodyBefore = "</head><body>";
	var bodyAfter = "</body></html>";
	var body = '';

	// var tags = config.nativeDom
	// for (var i in tags)
	// {
	// 	body += "<" + i + "></" + i + ">"
	// }
	body += "<script type='text/javascript' src='" + config.initPath + "'></script>";
	fs.writeFileSync(htmlPath, headBefore + bodyBefore + body + bodyAfter);
};