exports.struct = [{"name":"div","children":[{"name":"ul","attr":{"id":"frame"},"children":[{"name":"li","attr":{"style":"color:#000000; border: 0px;"},"children":[]},{"name":"li","children":[]}]}]}]
exports.init = function(dom){
(function(){

// something needs to init
	console.log('init...')
}).call(dom.id("frame"));
(function(){

// go dying
}).call(dom.id("line"));
}
exports.define = {
"div":require("C:\Users\carson\Downloads\nodejs\puppet-master\my-div"),
"ul":require("C:\Users\carson\Downloads\nodejs\puppet-master\my-ul"),
}
