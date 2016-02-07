(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

},{"./proto-dom.js":3}],2:[function(require,module,exports){
"use strict";

exports.cacheSet = function (dom, key, args)
{
	if (key == 'style')
	{
		if (args.length == 1 && typeof args[0] == 'string')
			args[0] = styleParse(args[0]);
		// console.log(args[0]);
		cacheStyleMerge(dom, args[0]);
	}
	else
		dom.cache[key] = args;
};

function styleParse (style)
{
	var obj = {};
	var list = style.split(';');
	for (var i = 0; i < list.length; i++)
	{
		if (list[i].indexOf(':') < 0)
			continue;
		var pair = list[i].split(':');
		obj[pair[0].trim()] = pair[1].trim();
	}
	return obj;
}

function cacheStyleMerge (dom, newStyle)
{
	if (dom.cache.style === undefined || dom.cache.style === null)
		dom.cache.style = {};
	var style = dom.cache.style;
	for (var i in newStyle)
	{
		style[i] = newStyle[i];
	}
}

// value (type: primitive, array)
exports.applySet = function (dom, key, args)
{
	// css
	if (key == 'style')
	{
		// object
		if (typeof args == 'object')
		{
			for (let i in args)
				dom.style[i] = args[i];
		}
		else
			throw 'wrong typeof style value: ' + typeof args;
	}
	// e.g. addEventListener...
	else if (args instanceof Array)
		dom[key].apply(dom, args);
	else
		throw 'cannot set an obj onto native-dom: ' + args;
};

},{}],3:[function(require,module,exports){
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
},{"./native-util.js":2,"./virtual-util.js":4}],4:[function(require,module,exports){
"use strict";

var SelfAttrList = ['id', 'class', 'ppy'];

// judge if id, class ...
exports.isSelfAttr = function (attr)
{
	if (SelfAttrList.indexOf(attr) >= 0)
		return true;
	return false;
};

// set id, class... (value : array)
exports.setSelf = function (dom, key, value)
{
	var index = dom.gate.index;
	// id
	if (key == 'id')
	{
		if (index.id.hasOwnProperty(value))
			throw 'you have dulplicate id: ' + value;
		index.id[value] = dom;
	}
	// class (html)
	else if (key == 'class')
	{
		if (index.class.hasOwnProperty(value))
			index.class[value].push(dom);
		else
			index.class[value] = [dom];
	}
	else if (key == 'ppy')
	{
		if (value == 'container')
			dom.gate.nativeContainer = dom.isNative ? dom.attach : dom.attach.nativeContainer;
	}
};

exports.cacheSet = function (dom, key, args)
{
	dom.cache[key] = args;
};

exports.applySet = function (dom, key, args)
{
	if (!(args instanceof Array))
		throw "can't set virtual-dom";
	dom.attach.api.apply(dom, args);
};

// find the root of dirty tree
exports.traceUp = function (start) 
{
	// find the highest dirty dom-tree
	while (start.gate.host && !start.gate.host.gate.done)
		start = start.gate.host;
	return start;
};

},{}],5:[function(require,module,exports){
exports.struct = [{"type":"tag","name":"div","attr":{"id":"box","style":"position: absolute;"},"children":[{"type":"tag","name":"div","attr":{"class":"button","style":"position: absolute; background-color: red; width: 20px; height: 20px; border-radius:25px;"},"children":[]},{"type":"tag","name":"div","attr":{"class":"button","style":"position: absolute; background-color: red; width: 20px; height: 20px; border-radius:25px;"},"children":[]},{"type":"tag","name":"div","attr":{"class":"button","style":"position: absolute; background-color: red; width: 20px; height: 20px; border-radius:25px;"},"children":[]},{"type":"tag","name":"div","attr":{"class":"button","style":"position: absolute; background-color: red; width: 20px; height: 20px; border-radius:25px;"},"children":[]},{"type":"tag","name":"div","attr":{"id":"container","ppy":"container","style":"background-color: #00eeff;"},"children":[]}]}]
exports.init = function(dom){
(function(){

"use strict";
	// get native-dom (need to be changed)
	var buttons = this.findDom('class', 'button');
	var container = this.findDom('id', 'container');
	var box = this.findDom('id', 'box');

	var offsetLeft = container.get('offsetLeft');
	var offsetTop = container.get('offsetTop');
	var offsetWidth = container.get('offsetWidth');
	var offsetHeight = container.get('offsetHeight');
	buttons[0].set('style', 
		{ 
			left: offsetLeft - 10 + 'px', 
			top: offsetTop - 10 + 'px' 
		});
	buttons[1].set('style', 
		{ 
			left: offsetLeft + offsetWidth - 10 + 'px',
			top: offsetTop - 10 + 'px'
		});
	buttons[2].set('style', 
		{ 
			left: offsetLeft - 10 + 'px',
			top: offsetTop + offsetHeight - 10 + 'px'			
		});
	buttons[3].set('style',
		{
			left: offsetLeft + offsetWidth - 10 + 'px',
			top: offsetTop + offsetHeight - 10 + 'px'
		});

	var moveBox = {
		dom: container,
		state: 'fix',
		left: box.get('offsetLeft'), top: box.get('offsetTop'),
		init: function () 
		{
			var dom = this.dom;
			dom.set('addEventListener', 'mousedown', function (e) 
			{
				moveBox.state = 'move';
				moveBox.left = e.clientX;
				moveBox.top = e.clientY;
			});
			box.globalListen('mouseup', function () 
			{
				moveBox.state = 'fix';
			});
			box.globalListen('mousemove', function (e) 
			{
				if (moveBox.state == 'move')
				{
					// console.log(e.clientX - moveBox.left + 'px');
					box.set('style',
						{
							left: box.get('offsetLeft') + e.clientX - moveBox.left + 'px',
							top: box.get('offsetTop') + e.clientY - moveBox.top + 'px'
						});
					moveBox.left = e.clientX;
					moveBox.top = e.clientY;
				}
			});
		}
	};
	moveBox.init();

	// move-button constructor
	function MoveButton (dom, index, buttons) 
	{
		this.left = dom.get('offsetLeft');
		this.top = dom.get('offsetTop');
		this.state = 'fix';
		var self = this;
		dom.set('addEventListener', 'mousedown', function (e)
		{
			self.state = 'move';
			self.left = e.clientX;
			self.top = e.clientY;
		});
		box.globalListen('mouseup', function ()
		{
			self.state = 'fix';
		});
		box.globalListen('mousemove', function (e)
		{
			if (self.state != 'move')
				return;
			var offsetLeft = e.clientX - self.left;
			var offsetTop = e.clientY - self.top;
			// dom.style.left = dom.offsetLeft + offsetLeft + 'px';
			// dom.style.top = dom.offsetTop + offsetTop + 'px';
			if (index === 0)
			{
				box.set('style', 
					{
						left: box.get('offsetLeft') + offsetLeft + 'px',
						top: box.get('offsetTop') + offsetTop + 'px'
					});
				container.set('style', 
					{
						width: container.get('offsetWidth') - offsetLeft + 'px',
						height: container.get('offsetHeight') - offsetTop + 'px'
					});
			}
			else if (index == 1)
			{
				container.set('style',
					{
						width: container.get('offsetWidth') + offsetLeft + 'px',
						height: container.get('offsetHeight') - offsetTop + 'px'
					});
				box.set('style', 'top:' + box.offsetTop + offsetTop + 'px');
			}
			else if (index == 2)
			{
				box.set('style', 'left:' + box.offsetLeft + offsetLeft + 'px');
				container.set('style', 
					{
						width: container.get('offsetWidth') - offsetLeft + 'px',
						height: container.get('offsetHeight') + offsetTop + 'px'
					});
			}
			else if (index == 3)
			{
				container.set('style', 
					{
						width: container.get('offsetWidth') + offsetLeft + 'px',
						height: container.get('offsetHeight') + offsetTop + 'px'
					});
			}
			buttons[0].set('style', 
				{
					left: '-10px', top: '-10px'
				});
			buttons[1].set('style', 
				{
					left: container.get('offsetWidth') - 10 + 'px', top: '-10px'
				});
			buttons[2].set('style', 
				{
					left: '-10px', top: container.get('offsetHeight') - 10 + 'px'
				});
			buttons[3].set('style', 
				{
					left: container.get('offsetWidth') - 10 + 'px', top: container.get('offsetHeight') - 10 + 'px'
				});
			
			self.left = e.clientX;
			self.top = e.clientY;
		});
	}

	for (var i = 0; i < buttons.length; i++) 
	{
		new MoveButton(buttons[i], i, buttons);
	}
}).call(dom);
}
exports.require = require
exports.api = require("/home/carson/code/puppet-master/node_modules/flexible-box/")

},{"/home/carson/code/puppet-master/node_modules/flexible-box/":6}],6:[function(require,module,exports){

},{}],7:[function(require,module,exports){
exports.struct = [{"type":"tag","name":"div","children":[{"type":"tag","name":"flexibleBox","children":[{"type":"tag","name":"div","children":[{"type":"text","data":"box 1"}]},{"type":"tag","name":"div","children":[{"type":"text","data":"box 2"}]},{"type":"tag","name":"div","children":[{"type":"text","data":"box 3"}]}]}]}]
exports.init = function(dom){
(function(){

// something needs to init
	console.log('I have added three boxes into flexible-box')
}).call(dom);
}
exports.require = require
exports.api = require("/home/carson/code/puppet-master/test")
exports.definedTag = {
"flexibleBox":require("flexible-box/constructor.js"),
}
exports.config = {"initPath":"/home/carson/code/puppet-master/test/all.js"}
require("/home/carson/code/puppet-master/lib/init").init(exports)
},{"/home/carson/code/puppet-master/lib/init":1,"/home/carson/code/puppet-master/test":8,"flexible-box/constructor.js":5}],8:[function(require,module,exports){
arguments[4][6][0].apply(exports,arguments)
},{"dup":6}]},{},[7]);
