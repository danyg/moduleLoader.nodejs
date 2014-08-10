/*
 *     (c) 2013-2014 Daniel Goberitz.
 *     Modules loader may be freely distributed under the MIT license.
 *     For all details and documentation:
 *     https://www.github.com/danyg/modulesLoader
 *
 * @license ModulesLoader 0.4.0 Copyright (c) 2013-2014 Daniel Goberitz
 * @author Daniel Goberitz <dalgo86@gmail.com>
 * 
 */

/** globals: require, global */
var path = require('path'),
	assert = require('assert'),
	BASE_PATH = path.dirname(require.main.filename),
	loadStrategies = {
		'model': {
			dirname: 'models/',
			loader: 'require',
			extension: ''
		},
		'view': {
			dirname: 'views/',
			loader: 'require',
			extension: ''
		},
		'template': {
			dirname: 'templates/',
			loader: 'require',
			extension: ''
		},
		'helper': {
			dirname: 'helpers/',
			loader: 'require',
			extension: ''
		},
		'widget': {
			dirname: 'widgets/',
			loader: 'require',
			extension: ''
		}
	},
	cache = {}
;

global.include = function include(strategy) {
	return getLoaderByKind(getKindFromStrategy(strategy))(BASE_PATH + '/' + global.include.resolve(strategy));
};

global.include.cache = cache;
global.include.setBasePath = function(basePath){
	BASE_PATH = path.normalize(basePath);
};

global.include.getBasePath = function(){
	return BASE_PATH;
};

global.include.setKind = function(kind, loader, extension, dirname){
	kind = kind.toLowerCase();
	if(!loadStrategies[kind]){
		assert.notEqual(extension, undefined, 'extension must be setted');
		assert.notEqual(dirname, undefined, 'dirname must be setted');
		loadStrategies[kind] = {};
	}

	loadStrategies[kind].loader = loader;
	if(extension !== undefined){
		loadStrategies[kind].extension = extension;
	}
	if(dirname !== undefined){
		loadStrategies[kind].dirname = dirname;
	}
};

global.include.resolve = function resolve(strategy){
	try{
		var tmp = strategy.split('!'),
			kind = tmp[0].toLowerCase(),
			moduleName = pathToUnix(tmp[1]),
			modulePath
		;

		if (kind === 'module') {
			modulePath = parseModuleName(moduleName);
			return modulePath;
		} else if (kind === 'service') {
			return 'services/' + parseName(moduleName, '/');
		} else {
			return normalizeInsider(moduleName, kind) + getExtensionByKind(kind);
		}
	}catch(e){
		console.log(e.stack);
		throw new Error('modulesloader: ERROR Resolving: \'' + strategy + '\' | ' + e.constructor.name + ': ' + e.message);
	}
};

function getKindFromStrategy(strategy){
	var tmp = strategy.split('!')
	return tmp[0].toLowerCase();
}

function pathToUnix(aPath) {
	return aPath.replace(/\\/g, '/');
}

function getDirNameByKind(kind){
	return loadStrategies[kind].dirname;
}

function getExtensionByKind(kind){
	return loadStrategies[kind].extension;
}

function getLoaderByKind(kind){
	if(kind === 'module' || kind === 'service'){
		return require;
	}
	try{
		var loader = loadStrategies[kind].loader;
		if(typeof loader === 'string'){
			loader = !!module[loader] ? module[loader] : GLOBAL[loader];
			if(loader === include){
				throw new TypeError('modulesLoader couldn\'t use include as a strategy loader for ' + kind);
			}
		}

		if(typeof loader !== 'function'){
			throw new TypeError('modulesLoader couldn\'t use the loader registered for ' + kind);
		}
	}catch(e){
		throw new TypeError('modulesLoader couldn\'t use the loader registered for ' + kind);
	}
	return loader;
}

function normalizeInsider(name, kind) {
	var currentPath = getModuleNameOfCaller(),
			root = currentPath.match(/(modules\/[^\/]*\/)/)
			;

	if (root && root[1]) {
		if (name.indexOf(root[1]) === -1) {
			return root[1] + getDirNameByKind(kind) + name;
		} else {
			return name;
		}
	} else {
		throw URIError(kind + '!' + name + ' unreachable from ' + currentPath);
	}
}

function parseName(name, glue) {
	var tmp = name.split('/');
	if (tmp.length === 1) {
		name = name + glue + name;
	} else if (tmp.length === 2) {
		name = tmp[0] + glue + tmp[1];
	} else if (tmp.length > 2) {
		throw new URIError('Ilegal module name \'' + name + '\'');
	}

	return name;
}

function parseModuleName(name) {
	if (name.indexOf('modules/') === -1) {
		// module!projects -> modules/projects/controllers/projects.js
		// module!projects/projectDetails -> modules/projects/controlers/projectDetails.js
		return 'modules/' + parseName(name, '/controllers/');
	} else {
		return name;
	}
}

function getModuleNameOfCaller() {
	var receiver = getCallerOfInclude();
	
	try{
		return pathToUnix(path.relative(BASE_PATH, receiver.filename));
	}catch(e){
		return BASE_PATH;
	}
}

function getCallerOfInclude() {
	var stack = getStack();
	var collect = false;
	var tmp = stack.filter(function(item) {
		if(!!item.receiver &&  item.receiver !== global){
			return item;
		}
		return undefined;
	});

	tmp.shift();
	tmp.shift();

	return tmp[0].receiver || {filename: BASE_PATH};
}

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