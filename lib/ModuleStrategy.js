/**
* @Overview
*
* @Author: Daniel Goberitz
* @Date:               2016-08-22 20:45:04
* @Last Modified time: 2016-08-22 21:34:12
*/

'use strict';
const assert = require('assert');
const fs = require('fs');
const path = require('path');

const AbstractStrategy = require('./AbstractStrategy');

function getStack() {
	// Save original Error.prepareStackTrace
	var origPrepareStackTrace = Error.prepareStackTrace;

	// Override with function that just returns `stack`
	Error.prepareStackTrace = function(_, stack) {
		return stack;
	};

	// Create a new `Error`, which automatically gets `stack`
	var err = new Error();

	// Evaluate `err.stack`, which calls our new `Error.prepareStackTrace`
	var stack = err.stack;

	// Restore original `Error.prepareStackTrace`
	Error.prepareStackTrace = origPrepareStackTrace;

	// Remove superfluous function call on stack
	stack.shift(); // getStack --> Error

	return stack;
}

class ModuleStrategy extends AbstractStrategy {
	constructor() {
		super();
		this._baseDir = 'modules';

		this._loadStrategies = {};
		this._handlers = [];

		this.addKind('module', 'controllers/');
		this.addKind('model', 'models/');
		this.addKind('view', 'views/');
		this.addKind('template', 'templates/', '.html', function(path) {
			return fs.readFileSync(path, {encoding: 'utf8'});
		});
		this.addKind('helper', 'helpers/');
	}

	getHandlers() {
		return this._handlers;
	}

	addKind(kind, dirname, extension, loader) {
		kind = kind.toLowerCase();
		assert.notEqual(kind, undefined, 'kind must be setted');
		if(!this._loadStrategies[kind]){
			assert.notEqual(dirname, undefined, 'dirname must be setted');
			this._loadStrategies[kind] = {};
			this._handlers.push(kind);
		}

		this._loadStrategies[kind].dirname = dirname;

		this._loadStrategies[kind].extension = (extension !== undefined) ? extension : '';
		this._loadStrategies[kind].loader = (loader === undefined) ?
			super.load.bind(this) :
			loader
		;
	}

	resolve(kind, name) {
		var moduleName = '';
		if(kind !== 'module') {
			moduleName = this._calculateCurrentModule(kind,name);
		} else {
			moduleName = name;
		}
		return this._baseDir + '/' + moduleName + '/' + this._loadStrategies[kind].dirname + name + this._loadStrategies[kind].extension;
	}

	_calculateCurrentModule(kind,name) {
		var stack = getStack(),
			ret,
			tmp,
			BASE_PATH = include.getBasePath(),
			notMe
		;

		tmp = stack
			.map(function(item) {
				notMe = !notMe ?
					item.getFileName().indexOf(BASE_PATH) !== -1 ?
						item.getFileName() :
						notMe :
					notMe
				;
				return item.getFileName();
			})
			.filter(function(item) {
				return (item.indexOf(path.sep + 'modules' + path.sep) !== -1);
			})
			.reverse()
		;

		if(!!tmp[0]) {
console.warn(tmp[0]);
			var match = tmp[0].match(/[\\/]modules[\\/]([^\\/]+)[\\/]/);
			ret = !!match && !!match[1] ? match[1] : false;
		} else {
			ret = false;
		}
		if(ret === false) {
			throw new URIError(`${kind}!${name} unreachable from ` + path.relative(include.getBasePath(), notMe).replace(/\\/g, '/').trim());
		}
		return ret;
	}
}

module.exports = ModuleStrategy;
