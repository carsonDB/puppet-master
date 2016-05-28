"use strict";

var input = "#box {color: #000000; border: 1px} .cup {padding: 1px;} span {see: false}";

function Scanner (input)
{
	// this.pos = 0;
	this.input = input;
	return this.read();
}


Scanner.prototype.read = function ()
{
	var list = [];
	for (let i = this.readItem(); i !== null; i = this.readItem())
	{
		list.push(i);
	}
	return list;

};

Scanner.prototype.outPatt = /^\s*([#.]?)([\w_][\w_\d]*)\s*{\s*/;
Scanner.prototype.tailPatt = /^\s*}\s*/;
Scanner.prototype.readItem = function ()
{
	// this.outPatt.lastIndex = this.pos;
	var head = this.outPatt.exec(this.input);
	// debugger;
	if (head === null)
		return null;
	// this.pos = this.outPatt.lastIndex;
	this.input = this.input.substr(head[0].length);
	var obj = {
		name: head[2],
		attr: {},
	};
	if (head[1] == '#')
		obj.type = 'id';
	else if (head[1] == '.')
		obj.type = 'class';
	else if (head[1] === '')
		obj.type = 'tag';
	else
		throw "cannot use '" + head[0] + " '";
	for (let i = this.readFactor(); i !== null; i = this.readFactor())
	{
		obj.attr[i[0]] = i[1];
	}
	// this.tailPatt.lastIndex = this.pos;
	var tail = this.tailPatt.exec(this.input);
	// this.pos = this.tailPatt.lastIndex;
	if (tail === null)
		throw "no tail";
	this.input = this.input.substr(tail[0].length);
	return obj;
};

Scanner.prototype.inPatt = /^\s*([\w_][\w_\d]*)\s*:\s*([^;}]*);?\s*/;
Scanner.prototype.readFactor = function ()
{
	// this.inPatt.lastIndex = this.pos;
	var result = this.inPatt.exec(this.input);
	// debugger;
	if (result === null)
		return null;
	this.input = this.input.substr(result[0].length);
	// this.pos = this.inPatt.lastIndex;
	return [result[1], result[2]];
};

module.exports = function (input) 
{
	return new Scanner(input);
};

var result = module.exports(input);
console.log(result);
// debugger;