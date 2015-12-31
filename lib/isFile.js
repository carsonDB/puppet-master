var fs = require('fs')

module.exports = function(path) {
	try {
		fs.accessSync(path)
	} 
	catch (err) {
		return false
	}
	return true
}