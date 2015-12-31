(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

},{"./proto-dom.js":2}],2:[function(require,module,exports){

module.exports = protoDom
var doc = document

function protoDom (share) 
{
	// this.attach = null,
	this.children = []
	// every node share the same place (include: indexing...)
	this.share = share
	this.isNative = true
}

protoDom.protoInit = function (node) 
{
	// link native-doms
	var nativeDoms = protoDom.nativeDom = node.config.nativeDom
	var nativeContainer = doc.body.children[0]
	var nativeTags = nativeContainer.children
	for (var i = 0; i < nativeTags.length; i++)
		nativeDoms[nativeTags[i].nodeName.toLowerCase()] = nativeTags[i]
};
// create native-doms with cache management
protoDom.prototype.createNative = function (name) 
{
	var nativeDoms = protoDom.nativeDom
	if (nativeDoms.hasOwnProperty(name) && nativeDoms[name] instanceof Object)
		return nativeDoms[name].cloneNode()
	else
	{
		nativeDoms[name] = doc.createElement(name)
		return nativeDoms[name].cloneNode()
	}
};
// create a local complete dom tree from a proto-node 
protoDom.createDom = function (node)
{
	var cxt = node.definedTag || {}
	var tag = node.struct[0] || {}
	// build with node.struct (return the root of a tree)
	var share = { 
		index: { id: {} },
		protoNode: node,
	}
	var dom = buildTag(tag, cxt, share)
	// init
	node.init(dom)
	return dom
};

function buildTag (tag, cxt, share)
{
	var dom = new protoDom(share)
	// add own id-index if have
	if (tag.attr)
		dom.attr(tag.attr)
	// build its puppet by two ways
	if (cxt.hasOwnProperty(tag.name))
	{
		dom.attach = protoDom.createDom(cxt[tag.name])
		dom.isNative = false
	}
	else
	{
		dom.attach = dom.createNative(tag.name)
		dom.isNative = true
	}
	// append children if any
	if (tag.hasOwnProperty('children'))
		for (var i = 0; i < tag.children.length; i++)
		{
			var childNode = buildTag(tag.children[i], cxt, dom.share)
			dom.children.push(childNode)
			dom.nativeAppend(childNode.nativeDom())
		}
	return dom
}

// creating utility
protoDom.prototype.create = function (name) 
{
	var definedTag = this.share.protoNode.definedTag
	if (definedTag.hasOwnProperty(name))
		return this.createDom(definedTag[name])
	else
		return this.createNative(name)
};
// element-query utilities
protoDom.prototype.id = function (name) 
{
	return this.share.index.id[name]
};

protoDom.prototype.get = function (name) 
{
	// body...
};

// link utility
protoDom.prototype.nativeAppend = function (nativeDom) 
{
	if (this.isNative == true)
		this.attach.appendChild(nativeDom)
	else if (this.share.protoNode.api.hasOwnProperty('appendChild'))
		this.share.protoNode.api.appendChild(nativeDom)
	else
		this.attach.nativeAppend(nativeDom)
};

protoDom.prototype.nativeDom = function () 
{
	if (this.isNative)
		return this.attach
	return this.attach.nativeDom()
};

// attr-set utility
protoDom.prototype.attr = function (attr) 
{
	// add own id-index
	if (attr.id)
		this.share.index.id[attr.id] = this
};
},{}],3:[function(require,module,exports){
exports.struct = [{"name":"b","children":[]}]
exports.init = function(dom){
(function(){

	alert('sb')
	// alert constructor
}).call(dom);
}
exports.api = require("C:\\Users\\carson\\Documents\\GitHub\\puppet-master\\node_modules\\alert\\")

},{"C:\\Users\\carson\\Documents\\GitHub\\puppet-master\\node_modules\\alert\\":4}],4:[function(require,module,exports){

exports.alert = function (argument) {
	console.log(argument);
}
},{}],5:[function(require,module,exports){
exports.struct = [{"name":"div","children":[{"name":"ul","attr":{"id":"frame"},"children":[{"name":"li","attr":{"style":"color:#000000; border: 0px;"},"children":[]},{"name":"li","children":[]},{"name":"alert","children":[]}]}]}]
exports.init = function(dom){
(function(){

// something needs to init
	console.log('init...')
}).call(dom.id("frame"));
(function(){

// go dying
}).call(dom.id("line"));
}
exports.api = require("C:\\Users\\carson\\Documents\\GitHub\\puppet-master\\test")
exports.definedTag = {
"alert":require("alert\\constructor.js"),
}
exports.definedAddr = {
"alert":"alert",
}
exports.require = require
exports.config = {"nativeDom":{"div":true,"ul":true,"li":true},"initPath":"C:\\Users\\carson\\Documents\\GitHub\\puppet-master\\test\\all.js"}
require("C:\\Users\\carson\\Documents\\GitHub\\puppet-master\\lib\\init.js").init(exports)
},{"C:\\Users\\carson\\Documents\\GitHub\\puppet-master\\lib\\init.js":1,"C:\\Users\\carson\\Documents\\GitHub\\puppet-master\\test":6,"alert\\constructor.js":3}],6:[function(require,module,exports){

},{}]},{},[5]);
