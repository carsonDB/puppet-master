"use strict";

var fs = require('fs');

exports.isFile = function(path) 
{
	try {
		fs.accessSync(path);
	} 
	catch (err) {
		return false;
	}
	return true;
};