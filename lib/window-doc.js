
window.doc = {
	// create native-dom
	create: function (name) 
	{
		var nativeDoms = this.nativeDom
		if (nativeDoms.hasOwnProperty(name) && nativeDoms[name] instanceof Object)
			return nativeDoms[name].cloneNode()
		else
		{
			nativeDoms[name] = document.createElement(name)
			return nativeDoms[name].cloneNode()
		}
	},
}