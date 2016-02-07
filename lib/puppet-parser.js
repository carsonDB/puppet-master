"use strict";

var htmlparser = require("htmlparser");
var fs = require('fs');
var initScript, initScriptHead, initScriptTail;

/* extract from 'src' to 'dst'
	1. extract js (haven't support other language)
	2. take ordinary tag(retain all attr), and traversal its children
	3. haven't extract css
	4. take full use of id (init script -> this)
*/
exports.extract = function (src, dst) 
{
	var rawHtml = fs.readFileSync(src, 'utf8');
	var outHtml = parse(rawHtml);
	// debugger
	// build node-structure for constructor.js
	initScript = '';
	initScriptHead = 'exports.init = function(dom){\n';
	initScriptTail = '}\n';
	var struct = travesal(outHtml);
	fs.writeFileSync(dst, 'exports.struct = ' + JSON.stringify(struct) + '\n' + initScriptHead + initScript + initScriptTail);
};

function travesal (input) 
{
	var struct = [];
	for (let i in input)
	{
		switch (input[i].type) {
		case 'script': 
			// recognize which language
			if (input[i].hasOwnProperty('attribs') && input[i].attribs.hasOwnProperty('type') && input[i].attribs.type != 'text/javascript')
			{
				// use other language, have to translate
				throw('have to be translate');
			}
			initScript += '(function(){\n';
			for (var j in input[i].children)
				initScript += input[i].children[j].raw;
			// append function tail with dom specific
			var idSeg = '';
			if (input[i].hasOwnProperty('attribs') && input[i].attribs.hasOwnProperty('id'))
				idSeg = '.findDom("id","' + input[i].attribs.id + '")';
			initScript += '}).call(dom' + idSeg + ');\n';
			break;

		case 'tag': 
			struct.push({
				type: 'tag',
				name: input[i].name,
				attr: input[i].attribs,
				children: travesal(input[i].children)
			});
			break;

		case 'text': 
			var textData = input[i].data;
			// filter '\n' and multi-spaces with single space
			textData = textData.replace(/\s+/g, " ");
			if (textData === '' || textData === ' ')
				break;
			struct.push({
				type: 'text',
				data: textData,					
			});
			break;
		}
	}
	return struct;
}

function parse (rawHtml)
{
	var handler = new htmlparser.DefaultHandler(function (error) {
	    if (error)
	        throw('error');
		// else
	 //    	[...parsing done, do something...]
	});
	var parser = new htmlparser.Parser(handler);
	parser.parseComplete(rawHtml);
	return handler.dom;
}
