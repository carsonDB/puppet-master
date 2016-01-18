
module.exports = protoDom
var Doc = document
var SelfAttrList = ['id', 'class']

function protoDom (gate) 
{
	// this.attach = null,
	this.children = []
	// every node share the same place -- gate (include: indexing...)
	this.gate = gate
	this.isNative = true
	this.cache = {}
}

protoDom.protoInit = function (node) 
{
	// link native-doms
	var nativeDoms = protoDom.nativeDom = node.config.nativeDom // attention: node-dirty
	var nativeContainer = Doc.body.children[0]
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
		nativeDoms[name] = Doc.createElement(name)
		return nativeDoms[name].cloneNode()
	}
};
// create a local complete dom tree from a proto-node 
protoDom.createDomTree = function (node)
{
	var cxt = node.definedTag || {}
	var tag = node.struct[0] || {}
	// build with node.struct (return the root of a tree)
	var gate = { 
		index: { id: {}, class: {} },
		protoNode: node,
		done: false,
	}
	var dom = buildTag(tag, cxt, gate)
	gate.root = dom
	// init
	node.init(dom)
	return gate
};

function buildTag (tag, cxt, gate)
{
	var dom = new protoDom(gate)
	// add own id-index if have
	if (tag.attr)
		dom.attr(tag.attr)
	// build its puppet by two ways
	if (cxt.hasOwnProperty(tag.name))
	{
		dom.attach = protoDom.createDomTree(cxt[tag.name])
		dom.attach.host = dom
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
			var childNode = buildTag(tag.children[i], cxt, dom.gate)
			dom.children.push(childNode)
			dom.nativeAppend(childNode.nativeDom())
		}
	return dom
}

// creating utility
protoDom.prototype.create = function (name) 
{
	var definedTag = this.gate.protoNode.definedTag
	if (definedTag.hasOwnProperty(name))
		return this.createDomTree(definedTag[name])
	else
		return this.createNative(name)
};
// element-query utilities
protoDom.prototype.id = function (name) 
{
	return this.gate.index.id[name]
};

protoDom.prototype.find = function (name) 
{
	// body...
};

// link utility
protoDom.prototype.nativeAppend = function (nativeDom) 
{
	if (this.isNative == true)
		this.attach.appendChild(nativeDom)
	else if (this.gate.protoNode.api.hasOwnProperty('appendChild'))
		this.gate.protoNode.api.appendChild(nativeDom)
	else
		this.attach.nativeAppend(nativeDom)
};

protoDom.prototype.nativeDom = function () 
{
	if (this.isNative)
		return this.attach
	return this.attach.nativeDom()
};

//****** Set and Cache ******
// format:
//	1. set(key, value, ..., value)
//	2. set({key: value, 
// 		key: value,
// 		...})
//		ps: if value is array, then value -> arguments
protoDom.prototype.set = function () 
{
	var obj = {}
	if (!arguments[0])
		throw "few arguments"
	// format1
	else if (typeof arguments[0] == 'string')
		obj[arguments[0]] = arguments.slice(1)
	// format2
	else if (typeof arguments[0] == 'object' && !(arguments[0] instanceof Array))
		obj = arguments[0]
	else
		throw "wrong input"
	// cache or self-set
	for (var i in obj)
		if (isSelfAttr(i))
			setSelf(i, obj[i])
		else
			this.cache[i] = obj[i]
};
protoDom.prototype.setSync = function (key, value) {
	// body...
}
// judge if id, class
protoDom.prototype.isSelfAttr = function (attr) 
{
	if (SelfAttrList.indexOf(attr))
		return true
	return false
}
// set id, class... ()
protoDom.prototype.setSelf = function (key, value) 
{
	var index = this.gate.index
	// id
	if (key == 'id')
	{
		index.id[value] = this
	}
	// class (html)
	else if (key == 'class')
	{
		if (index.class.hasOwnProperty(value))
			index.class[value].push(this)
		else
			index.class[value] = [this]
	}
};

//****** End of Event and Render ******
// trace-up: trace up until one's 'done' is true
// render: start from one and render its children recursively
function traceUp (start) 
{
	// find the highest dirty dom-tree
	while (start.gate.host && !start.gate.host.gate.done)
		start = start.gate.host
	return start
};
protoDom.prototype.render = function () {
	var cache = this.cache
	for (var key in cache)
	{
		// array -> arguments
		if (cache[key] instanceof Array)
			this.attach.apply(this.attach, cache[key])
		else
			this.attach[key](cache[key])
		cache[key] = undefined
	}
	// render its ownee
	if (!this.isNative)
		this.attach.render()
	// render its children
	for (var i = 0; i < this.children.length; i++)
		this.children[i].render()
	this.gate.done = true
};
// end of event
protoDom.prototype.endEvent = function () {
	// beforeRender event happen

	// trace-up
	var dirtyRoot = traceUp(this)
	// render
	dirtyRoot.render()
	// afterRender event happen

};