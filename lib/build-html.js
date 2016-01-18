var path = require('path')
var fs = require('fs')

module.exports = function (htmlPath, config) 
{
	var headBefore = "<!DOCTYPE html><html><head>"
	var bodyBefore = "</head><body><div style='display:none'>"
	var bodyAfter = "</body></html>"
	var body = ''

	// var tags = config.nativeDom
	// for (var i in tags)
	// {
	// 	body += "<" + i + "></" + i + ">"
	// }
	body += "</div><script type='text/javascript' src='" + config.initPath + "'></script>"
	fs.writeFileSync(htmlPath, headBefore + bodyBefore + body + bodyAfter)
}