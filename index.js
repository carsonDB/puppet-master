var path = require('path')
var fs = require('fs')
var parser = require('./puppet-parser.js')

buildPackage(__dirname)

function buildPackage (packagePath) {

	var constructorPath = path.join(packagePath, '/constructor.js')
	var htmlPath = path.join(packagePath, '/index.html')
	var configPath = path.join(packagePath, '/ui_config.json')

	// from index.html
	parser.extract(htmlPath, constructorPath)

	// append tag-context
	var ui_config = fs.readFileSync(configPath, 'utf8')
	ui_config = JSON.parse(ui_config)

	if (ui_config)
	{
		var tags = ui_config.define
		fs.appendFileSync(constructorPath, 'exports.define = {\n')
		for (var i in tags)
		{
			fs.appendFileSync(constructorPath, '\"' + i + '\"\:' + 'require(\"' + path.normalize(path.join(packagePath, tags[i])) + '\"\)\,\n')
		}
		fs.appendFileSync(constructorPath, '}\n')
	}
}
