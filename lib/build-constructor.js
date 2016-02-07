"use strict";

var path = require('path');
var fs = require('fs');
var parser = require('./puppet-parser.js');
var isFile = require('./util/isFile.js');

//******constructor.js******
// 1  "struct" (of nodes-tree)
// 2  "init" (script)
// 3  "api" (from index.js...)
// 4  "definedTag" (from ui_config.json)
// 5  "require" (self)
// 6* "config" and "init" (only in head-constructor.js)

var walkRecord = {};  // record packages having built
module.exports = buildPackage;

function buildPackage (packagePath) 
{
	// debugger
	// prepare
	var constructorPath = path.join(packagePath, '/constructor.js');
	var defaultConfigPath = path.join(packagePath, '/ui_config.json');
	var ui_config = isFile(defaultConfigPath) ? JSON.parse(fs.readFileSync(defaultConfigPath, 'utf8')) : {};
	if (!ui_config.main)
		ui_config.main = './index.html';

	//******extract html******
	// two kinds of path:
	// 	1. ui_cofig.main
	// 	2. index.html (by default)
	//
	// usage: parser.extract (src, dst)
	parser.extract(path.join(packagePath, ui_config.main), constructorPath);
	
	// can require locally (for next path)
	fs.appendFileSync(constructorPath, 'exports.require = require\n');

	// add api
	fs.appendFileSync(constructorPath, 'exports.api = require("' + packagePath.replace(/\\/g, '\\\\') + '")\n');

	// debugger;
	// extract ui_config.define
	if (ui_config.define === undefined || ui_config.define === null)
		return;
	var tags = ui_config.define;
	
	// traversal defined-tag packages recursively
	var localResolve = require(constructorPath).require.resolve;
	walkRecord[packagePath] = true;
	for (let i in tags)
	{
		// export-html and export-js at the same path (???)
		var nextDir = path.join(localResolve(tags[i]), '../');
		if (walkRecord[nextDir])
			throw('You have circuits in define-tags chain');
		else
			buildPackage(nextDir);
	}
	
	// append defined-tags
	var appendDefinedTag = 'exports.definedTag = {\n';
	for (let i in tags)
	{
		appendDefinedTag += '\"' + i + '\"\:' + 'require(\"' + path.join(tags[i], '/constructor.js').replace(/\\/g, "\\\\") + '\"\)\,\n';
	}
	appendDefinedTag += '}\n';
	fs.appendFileSync(constructorPath, appendDefinedTag);
}