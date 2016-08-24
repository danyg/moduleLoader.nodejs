/**
* @Overview
*
* @Author: Daniel Goberitz
* @Date:               2016-08-22 19:38:24
* @Last Modified time: 2016-08-24 02:43:33
*/

'use strict';

var TEST_BASE_PATH;
var path = require('path');
var util = require('util');
var AbstractStrategy;

describe('Modular Strategies Specs', function(){

	beforeEach(function(){

		AbstractStrategy = require('../../moduleLoader').AbstractStrategy;

		TEST_BASE_PATH = path.resolve(__dirname + '/../');
		include.setBasePath(TEST_BASE_PATH);
	});

	it('modulesLoader should expose the AbstractStrategy for Modular Strategies', function() {
		expect(typeof AbstractStrategy).toBe('function', 'AbstractStrategy should be Present');
	});

	describe('AbstractStrategy', function() {
		var Plugins;

		beforeEach(function() {

			Plugins = class Plugins extends AbstractStrategy {
				constructor(handlerOps) {
					super(handlerOps);
					this._baseDir = 'plugins';
				}

				resolve(kind, moduleName) {
					if(moduleName === '') {
						return '!list';
					}
					return this._baseDir + '/' + moduleName + '.js';
				}

				getHandlers() {
					return ['plugin'];
				}

				load(path) {
					if(path.indexOf('!list') !== -1) {
						return [
							super.load(include.getBasePath() + '/' + this._baseDir + '/Plugin1.js'),
							super.load(include.getBasePath() + '/' + this._baseDir + '/Plugin2.js')
						];
					} else {
						return super.load(path);
					}
				}
			};

			include.registerStrategy(Plugins);
		});

		afterEach(function() {
			include.unregisterStrategy(Plugins);
		});

		it('should provide the option to create a new strategy', function() {
			var plugin1 = include('plugin!Plugin1');
			expect(plugin1.name).toEqual('Plugin 1');
			expect(plugin1).toBe(require('../plugins/Plugin1'));
		});

		it('should be able to unregisterStrategy and register it again', function() {
			// afterEach and beforEach does the WHEN action
			var plugin2 = include('plugin!Plugin2');
			expect(plugin2.name).toEqual('Plugin 2');
			expect(plugin2).toBe(require('../plugins/Plugin2'));
		});

		it('should fail if another strategy wants to use the same handler', function() {
			class AnotherPlugin extends Plugins {

			}
			function toThrow() {
				include.registerStrategy(AnotherPlugin);
			}

			expect(toThrow).toThrowError(Error, `The Handler 'plugin' is already in use`);
		});

		it('should be able to return the strategy instance', function() {
			var pInstance = include.getStrategy(Plugins);
			expect(pInstance instanceof Plugins).toBe(true);
		});

		it('should be able to modify the kind after construction', function() {
			var pInstance = include.getStrategy(Plugins);

			// shouldHappendInside
			pInstance._handlerOps.removeHandler('plugin');

			function toThrow() {
				include('plugin!Plugin1');
			}

			expect(toThrow).toThrowError(TypeError, `Unrecognized strategy 'plugin!Plugin1' kind 'plugin' is not a valid kind`);

			// shouldHappendInside
			pInstance._handlerOps.addHandler('plugin', pInstance);
			expect(toThrow).not.toThrow();
		});

	});


});
