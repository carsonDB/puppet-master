var protoDom = require('./proto-dom.js')

// runing in browsers to init
exports.init = function(node) 
{
	// init proto-dom
	protoDom.protoInit(node)
	// build doms and link to document.body...
	protoDom.entryDom = protoDom.createDom(node)
	document.body.appendChild(protoDom.entryDom.nativeDom())
};
