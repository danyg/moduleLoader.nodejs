/**
* @Overview
*
* @Author: Daniel Goberitz
* @Date:               2016-08-22 20:45:04
* @Last Modified time: 2016-08-24 02:36:41
*/

'use strict';
const assert = require('assert');
const fs = require('fs');
const path = require('path');

const AbstractStrategy = require('./AbstractStrategy');

function getStack() {
	var origPrepareStackTrace = Error.prepareStackTrace;
	Error.prepareStackTrace = function(_, stack) {
		return stack;
	};
	var err = new Error();
	var stack = err.stack;
	Error.prepareStackTrace = origPrepareStackTrace;
	stack.shift(); // getStack --> Error
	return stack;
}

class ModuleStrategy extends AbstractStrategy {
	constructor(handlerOps) {
		super(handlerOps);
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
		this.addKind('widget', 'widgets/');

		this._registered = false;
	}

	load(filePath, kind/*, moduleName*/) {
		return this._loadStrategies[kind].loader(filePath);
	}

	getHandlers() {
		return this._handlers;
	}

	addKind(kind, dirname, extension, loader) {
		if(typeof kind !== 'string') {
			dirname = kind.dirname;
			extension = kind.extension;
			loader = kind.loader;

			kind = kind.kind;
		}

		kind = kind.toLowerCase();
		if(this._isRegistered()) {
			this._handlerOps.addHandler(kind, this);
		}

		try {

			assert.notEqual(kind, undefined, 'kind must be setted');
			if(!this._loadStrategies[kind]){
				assert.notEqual(dirname, undefined, 'dirname must be setted');
				this._loadStrategies[kind] = {};
				this._handlers.push(kind);
			}

			this._loadStrategies[kind].kind = kind;
			this._loadStrategies[kind].dirname = dirname;

			this._loadStrategies[kind].extension = (extension !== undefined) ? extension : '';
			this._loadStrategies[kind].loader = (loader === undefined) ?
				super.load.bind(this) :
				loader
			;
		} catch(e) {
			this._handlerOps.removeKind(kind);
			throw e;
		}
	}

	removeKind(kind) {
		kind = kind.toLowerCase();
		delete this._loadStrategies[kind];
		this._handlerOps.removeHandler(kind);
	}

	getKindDefinition(kind) {
		return this._loadStrategies[kind] || null;
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
