/*
 *     (c) 2013-2016 Daniel Goberitz.
 *     Modules loader may be freely distributed under the MIT license.
 *     For all details and documentation:
 *     https://www.github.com/danyg/modulesLoader
 *
 * @license ModulesLoader 0.5.0 Copyright (c) 2013-2014 Daniel Goberitz
 * @author Daniel Goberitz <dalgo86@gmail.com>
 *
 */

/** globals: require, global */
'use strict';

var HANDLERS = {};
var STRATEGIES = {};

const AbstractStrategy = require('./lib/AbstractStrategy');
module.exports.AbstractStrategy = AbstractStrategy;

const ServiceStrategy = require('./lib/ServiceStrategy');
module.exports.ServiceStrategy = ServiceStrategy;

const ModuleStrategy = require('./lib/ModuleStrategy');
module.exports.ModuleStrategy = ModuleStrategy;

var path = require('path'),
	BASE_PATH = path.dirname(require.main.filename)
;

function pathToUnix(aPath) {
	return aPath.replace(/\\/g, '/');
}

function splitStrategy(strategy) {
	var tmp = strategy.split('!'),
		kind = tmp[0].toLowerCase(),
		moduleName = pathToUnix(tmp[1])
	;
	return {
		kind: kind,
		moduleName: moduleName
	};
}

global.include = function include(strategy) {
	var {kind, moduleName} = splitStrategy(strategy);
	if(HANDLERS.hasOwnProperty(kind)) {
		var strategyHandler = HANDLERS[kind];
		return strategyHandler.load(
			BASE_PATH + '/' + global.include.resolve(strategy),
			kind,
			moduleName
		);
	} else {
		throw new TypeError(`Unrecognized strategy '${strategy}' kind '${kind}' is not a valid kind`);
		// LEGACY CODE
		// return getLoaderByKind(getKindFromStrategy(strategy))(BASE_PATH + '/' + global.include.resolve(strategy));
	}
};

global.include.setBasePath = function(basePath){
	BASE_PATH = path.normalize(basePath);
};

global.include.getBasePath = function(){
	return BASE_PATH;
};

global.include.resolve = function resolve(strategy){
	try{
		var {kind, moduleName} = splitStrategy(strategy);

		if(HANDLERS.hasOwnProperty(kind)) {
			return HANDLERS[kind].resolve(kind, moduleName);
		}
	}catch(e){
		throw new Error('modulesloader: ERROR Resolving: \'' + strategy + '\' | ' + e.constructor.name + ': ' + e.message);
	}
};

var handlerOps = {
	removeHandler: function(kind){
		if(HANDLERS.hasOwnProperty(kind)) {
			delete HANDLERS[kind];
		}
	},

	addHandler: function(kind, strategy) {
		if(!HANDLERS.hasOwnProperty(kind)) {
			HANDLERS[kind] = strategy;
		} else {
			throw new Error(`The Handler '${kind}' is already in use`);
		}
	}
};

global.include.registerStrategy = function registerStrategy(Strategy) {
	if(!STRATEGIES.hasOwnProperty(Strategy.name)) {
		var strategy = new Strategy(handlerOps);
		if(strategy instanceof AbstractStrategy) {
			var handlers = strategy.getHandlers(),
				kind
			;
			for(var i = 0; i < handlers.length; i++) {
				kind = handlers[i].toLowerCase();
				handlerOps.addHandler(kind, strategy);
			}

			STRATEGIES[Strategy.name] = strategy;
			strategy.registered();
		} else {
			throw new TypeError(strategy.constructor.name + ' is not in the hierarchy of include.AbstractStrategy');
		}
	}
};

global.include.getStrategy = function(Strategy) {
	if(STRATEGIES.hasOwnProperty(Strategy.name)) {
		return STRATEGIES[Strategy.name];
	}
	return null;
};

global.include.unregisterStrategy = function registerStrategy(Strategy) {
	if(STRATEGIES.hasOwnProperty(Strategy.name)) {
		var strategy = STRATEGIES[Strategy.name];
		var handlers = strategy.getHandlers(),
			kind
		;
		for(var i = 0; i < handlers.length; i++) {
			kind = handlers[i].toLowerCase();
			handlerOps.removeHandler(kind);
		}
		delete STRATEGIES[Strategy.name];
	}
};

global.include.registerStrategy(ServiceStrategy);
global.include.registerStrategy(ModuleStrategy);
