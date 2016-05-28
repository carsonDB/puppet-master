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

exports.getNativeContainer = function (dom)
{
	return dom.isNative ? dom.attach : dom.attach.nativeContainer;
};

exports.getNativeRoot = function (dom)
{
	return dom.isNative ? dom.attach : dom.attach.nativeRoot;
};

exports.appendNativeChild = function (vParent, vChild) 
{
	var nChild = exports.getNativeRoot(vChild);
	var nParent = exports.getNativeContainer(vParent);
	if (nChild === undefined || nChild === null)
		throw "missing virtual-dom's nativeRoot";
	if (nParent === undefined || nParent === null)
		throw "missing virtual-dom's nativeContainer";
	nParent.appendChild(nChild);
};

exports.removeNativeChild = function (vParent, vChild)
{
	var nChild = exports.getNativeRoot(vChild);
	var nParent = exports.getNativeContainer(vParent);
	if (nChild === undefined || nChild === null)
		throw "missing virtual-dom's nativeRoot";
	if (nParent === undefined || nParent === null)
		throw "missing virtual-dom's nativeContainer";
	return nParent.removeNode(nChild);
};