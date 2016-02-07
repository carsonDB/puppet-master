"use strict";

var path = require('path');
var fs = require('fs');
var browserify = require('browserify');
var buildConstructor = require('./lib/build-constructor.js');
var buildHTML = require('./lib/build-html');
// var countTag = require('./lib/count-native-tag.js')

// receive command
// preprocess from a start package
var startPath = path.join(__dirname, '/test');
var constructorPath = path.join(startPath, '/constructor.js');
var htmlPath = path.join(startPath, '/out.html');
buildConstructor(startPath);

// var nativeTags = countTag(startPath)

// config for html file
var config = {
	// nativeDom: nativeTags,
	initPath: path.join(startPath, '/all.js'),
};
fs.appendFileSync(constructorPath, 'exports.config = ' + JSON.stringify(config) + '\n');

// launch at front end
fs.appendFileSync(constructorPath, 'require("' + path.join(__dirname, '/lib/init').replace(/\\/g, "\\\\") + '").init(exports)');

// generate one final html
buildHTML(htmlPath, config);

// bundle up using browserify.js
var alljsPath = path.join(startPath, '/all.js');
fs.writeFileSync(alljsPath, '');
browserify(constructorPath).bundle(function (err, buff) {
	fs.appendFileSync(alljsPath, buff);
});
