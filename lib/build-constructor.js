var path = require('path')
var fs = require('fs')
var parser = require('./puppet-parser.js')
var isFile = require('./isFile.js')

// build constructor with node-struct and node-initScript
var walkRecord = {}
module.exports = buildPackage

function buildPackage (packagePath) 
{
	var constructorPath = path.join(packagePath, '/constructor.js')
	var htmlPath = path.join(packagePath, '/index.html')
	var configPath = path.join(packagePath, '/ui_config.json')

	// from index.html
	parser.extract(htmlPath, constructorPath)
	// add api
	fs.appendFileSync(constructorPath, 'exports.api = require("' + packagePath.replace(/\\/g, '\\\\') + '")\n')

	// append tag-context
	if (!isFile(configPath))
		return
	var appendDefinedTag = 'exports.definedTag = {\n', appendAddr = 'exports.definedAddr = {\n'
	var ui_config = fs.readFileSync(configPath, 'utf8'), tags = []
	ui_config = JSON.parse(ui_config)
	tags = ui_config.define
	// no extra custom tags
	if (!tags)
		return
	// have extra custom tags
	for (var i in tags)
	{
		appendDefinedTag += '\"' + i + '\"\:' + 'require(\"' + path.join(tags[i], '/constructor.js').replace(/\\/g, "\\\\") + '\"\)\,\n'
		appendAddr += '\"' + i + '\"\:\"' + tags[i] + '\"\,\n'
	}
	appendDefinedTag += '}\n', appendAddr += '}\n'		
	fs.appendFileSync(constructorPath, appendDefinedTag)
	fs.appendFileSync(constructorPath, appendAddr)
	fs.appendFileSync(constructorPath, 'exports.require = require\n')
	// end of building a constructor

	// traversal defined-tag packages recursively
	var constructor = require(constructorPath)
	walkRecord[constructorPath] = true
	for (var i in constructor.definedAddr)
	{
		var nextPath = path.join(constructor.require.resolve(constructor.definedAddr[i]), '../')
		if (walkRecord[nextPath])
			throw('You have circuits in define-tags chain')
		else
			buildPackage(nextPath)
	}
}