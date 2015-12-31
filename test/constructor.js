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