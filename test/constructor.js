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