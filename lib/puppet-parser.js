var htmlparser = require("htmlparser")
var fs = require('fs')
var initScript;

/* extract from 'src' to 'dst'
	1. extract from src and write to dst
	2. extract script (haven't support other language)
	3. take ordinary tag(retain all attr), and traversal its children
	4. haven't extract css
	5. take full use of id (init script -> this)
*/
exports.extract = function (src, dst) 
{
	var rawHtml = fs.readFileSync(src, 'utf8')
	var outHtml = parse(rawHtml)
	// build constructor
	initScript = '', initScriptHead = 'exports.init = function(dom){\n', initScriptTail = '}\n'
	var struct = travesal(outHtml)
	fs.writeFileSync(dst, 'exports.struct = ' + JSON.stringify(struct) + '\n' + initScriptHead + initScript + initScriptTail)	
}

function travesal (input) 
{
	var struct = []
	for (var i in input)
	{
		// init script 
		if (input[i].type == 'script')
		{
			// recognize which language
			if (input[i].hasOwnProperty('attribs') && input[i].attribs.hasOwnProperty('type') && input[i].attribs.type != 'text/javascript')
			{
				// use other language, have to translate
				throw('have to be translate')
			}
			initScript += '(function(){\n'
			for (var j in input[i].children)
				initScript += input[i].children[j].raw
			// append function tail with dom specific
			var idSeg = ''
			if (input[i].hasOwnProperty('attribs') && input[i].attribs.hasOwnProperty('id'))
				idSeg = '.id(\"' + input[i].attribs.id + '\")'
			initScript += '}).call(dom' + idSeg + ');\n'
		}
		// tags
		if (input[i].type == 'tag')
		{
			struct.push({
				name: input[i].name,
				attr: input[i].attribs,
				children: travesal(input[i].children)
			})
		}
	}
	return struct
}

function parse (rawHtml)
{
	var handler = new htmlparser.DefaultHandler(function (error, dom) {
	    if (error)
	        throw('error')
		// else
	 //    	[...parsing done, do something...]
	});
	var parser = new htmlparser.Parser(handler);
	parser.parseComplete(rawHtml);
	return handler.dom
}
