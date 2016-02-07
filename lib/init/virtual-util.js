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
