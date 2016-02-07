"use strict";

var nUtil = require('./native-util.js');
var vUtil = require('./virtual-util.js'); 

var Doc = document;

// Interface: dom-constructor
module.exports = ProtoDom;
function ProtoDom (gate) 
{
	this.attach = null;
	this.children = [];
	// every node share the same place -- gate (include: indexing...)
	this.gate = gate;
	// by default
	this.isNative = true;
	this.cache = {};
}
// one pool for every type of dom
ProtoDom.pool = {};


// Interface: create native-doms with cache management
ProtoDom.prototype.createNative = function (name, value)
{
	// text
	if (name == 'text')
		return Doc.createTextNode(value);
	// other
	var nativeDoms = ProtoDom.pool;
	if (nativeDoms.hasOwnProperty(name) && nativeDoms[name] instanceof Object)
		return nativeDoms[name].cloneNode();
	else
	{
		nativeDoms[name] = Doc.createElement(name);
		return nativeDoms[name].cloneNode();
	}
};
// create a local complete dom tree from a class-node 
ProtoDom.createDomTree = function (node) 
{
	var cxt = node.definedTag || {};
	var tag = node.struct[0] || {};
	// build with node.struct (return the <virtual>root of a tree)
	var gate = { 
		index: { id: {}, class: {} },
		api: node.api,
		context: node.definedTag || {},
		classNode: node,
		done: false,
	};
	var dom = buildTags(tag, cxt, gate);
	// logical and physical roots
	gate.root = dom;
	gate.nativeRoot = dom.isNative ? dom.attach : dom.attach.nativeRoot;
	// dom init (script)
	node.init(dom);

	return gate;
};

function buildTags (tag, cxt, gate)
{
	var dom = new ProtoDom(gate);
	// build its puppet by two ways + text
	if (tag.type == 'text')
	{
		dom.attach = dom.createNative('text', tag.data);
		dom.isNative = true;
	}
	else if (cxt.hasOwnProperty(tag.name))
	{
		dom.attach = ProtoDom.createDomTree(cxt[tag.name]);
		dom.attach.host = dom;
		dom.isNative = false;
	}
	else
	{
		dom.attach = dom.nativeContainer = dom.createNative(tag.name);
		dom.isNative = true;
	}
	// add style, attr ... 
	if (tag.attr)
		for (let i in tag.attr)
			dom.set(i, tag.attr[i]);
	// append children if any
	if (tag.hasOwnProperty('children'))
		for (let i = 0; i < tag.children.length; i++)
		{
			var childNode = buildTags(tag.children[i], cxt, gate);
			dom.children.push(childNode);
			var nativeContainer = dom.isNative ? dom.attach : dom.attach.nativeContainer;
			var nativeRoot = childNode.isNative ? childNode.attach : childNode.attach.nativeRoot;
			nativeContainer.appendChild(nativeRoot);
		}
	return dom;
}

// utility for creating
ProtoDom.prototype.create = function (name) 
{
	var cxt = this.gate.context;
	if (cxt.hasOwnProperty(name))
		return this.createDomTree(cxt[name]);
	else
		return this.createNative(name);
};
// get-element utilities
ProtoDom.prototype.findDom = function (selector, name)
{
	var index = this.gate.index;
	switch (selector)
	{
		case 'id': return index.id[name];
		case 'class': return index.class[name];
		default: throw 'no such index:' + selector;
	}
};
// get attrs of both native and vitual doms 
ProtoDom.prototype.get = function (name) 
{
	if (vUtil.isSelfAttr(name))
		if (this.hasOwnProperty(name))
			return this[name];
		else
			throw 'no such self-attr: ' + name;
	if (this.isNative)
		return this.attach[name];
	else
		throw '#show virtual dom attr';
};

//****** Set and Cache ******
// format:
//	1. set(key, value, ..., value)
//	2. set({key: value, 
// 		key: value,
// 		...})
// out: "value" is array, corresponding to "arguments"
ProtoDom.prototype.set = function ()
{
	var obj = {};
	if (arguments.length === 0)
		throw "few arguments";
	// format0 (key, value)
	else if (typeof arguments[0] == 'string' && arguments.length == 2)
		obj[arguments[0]] = [arguments[1]];
	// format1 (key, value...)
	else if (typeof arguments[0] == 'string' && arguments.length > 2)
	{
		let list = obj[arguments[0]] = [];
		for (let i = 1; i < arguments.length; i++)
			list.push(arguments[i]);
	}
	// format2 ({key1: value1...})
	else if (typeof arguments[0] == 'object' && !(arguments[0] instanceof Array))
	{
		obj = arguments[0];
		for (let i in obj)
			if (!(obj[i] instanceof Array))
				obj[i] = [obj[i]];
	}
	else
		throw "wrong input";
	// cache or self-set
	for (let i in obj)
		if (vUtil.isSelfAttr(i))
			vUtil.setSelf(this, i, obj[i]);
		else
		{
			// virtual-dom
			if (this.isNative === false)
			{
				// validate
				if (!this.attach.api.hasOwnProperty(i))
					throw "can't set " + i + ", because cannot find in its api";
				else
					vUtil.cacheSet(this, i, obj[i]);
			}
			// native-dom
			else
				nUtil.cacheSet(this, i, obj[i]);
		}
};
// native-set
ProtoDom.prototype.css = function ()
{

};
// ProtoDom.prototype.setSync = function (key, value)
// {
// 	// body...
// };

//Interface: event-listen managment
ProtoDom.prototype.listen = function (name, handle)
{
	var self = this;
	if (this.isNative)
		this.attach.addEventListener(name, function(e) { handle(e); self.render(); });
	else
		throw "listen virtual-dom...";
};
ProtoDom.prototype.globalListen = function (name, handle)
{
	var self = this;
	document.addEventListener(name, function(e) { handle(e); self.render(); });
};

//****** End of Event and Render ******
// trace-up: trace up until one's 'done' is true
// render: start from one and render its children recursively

ProtoDom.prototype.render = function ()
{
	var cache = this.cache;
	var attach = this.attach;
	for (let i in cache)
	{
		// filter null
		if (cache[i] === undefined || cache[i] === null)
			continue;
		// native-dom set
		if (this.isNative === true)
			nUtil.applySet(attach, i, cache[i]);
		// virtual-dom set
		else
			vUtil.applySet(attach, i, cache[i]);
		cache[i] = null;
	}
	// render its ownee
	if (!this.isNative)
		attach.root.render();
	// render its children
	for (let i = 0; i < this.children.length; i++)
		this.children[i].render();
	this.gate.done = true;
};
// end of event
ProtoDom.prototype.endEvent = function () 
{
	// beforeRender event happen

	// trace-up and render
	var dirtyRoot = vUtil.traceUp(this);
	dirtyRoot.render();
	// afterRender event happen

};