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
	BASE_PATH = path.dirname(require.main.filename),
	InsiderKinds = {
		'model': 'models/',
		'view': 'views/',
		'template': 'templates/',
		'helper': 'helpers/',
		'widget': 'widgets/'
	}
;

global.include = function include(strategy) {
	return require(BASE_PATH + '/' + global.include.resolve(strategy));
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
			return normalizeInsider(moduleName, kind);
		}
	}catch(e){
		throw new Error('modulesloader: ERROR Resolving: \'' + strategy + '\' | ' + e.constructor.name + ': ' + e.message);
	}
};

function pathToUnix(aPath) {
	return aPath.replace(/\\/g, '/');
}

function normalizeInsider(name, kind) {
	var currentPath = getModuleNameOfCaller(),
			root = currentPath.match(/(modules\/[^\/]*\/)/)
			;

	if (root && root[1]) {
		if (name.indexOf(root[1]) === -1) {
			return root[1] + InsiderKinds[kind] + name;
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
	return pathToUnix(path.relative(BASE_PATH, getCallerOfInclude().filename));
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