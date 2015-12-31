var path = require('path')

var tagStat = {}, struct = {}, definedTag = {}

module.exports = function (packagePath) {
	var nodePath = path.join(packagePath, '/constructor.js')
	var node = require(nodePath)
	walk(node)
	return tagStat
}

function walk (node) 
{
	struct = node.struct || {}
	definedTag = node.definedTag || {}
	countNode(node.struct)
	// look for next tags
	for (var i in definedTag)
		walk(definedTag[i])
}

function countNode (dom) 
{
	for (var i in dom)
	{
		if (!definedTag.hasOwnProperty(dom[i].name))
			tagStat[dom[i].name] = true
		if (dom[i].children)
			countNode(dom[i].children)
	}
}