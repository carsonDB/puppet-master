
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