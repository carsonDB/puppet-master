"use strict";

var ProtoDom = require('./proto-dom.js');

// runing in browsers to init
exports.init = function(node) 
{
	// build doms (return 'gate')
	ProtoDom.entry = ProtoDom.createDomTree(node);
	ProtoDom.entry.root.render();
	// append root to body
	document.body.appendChild(ProtoDom.entry.nativeRoot);
};
