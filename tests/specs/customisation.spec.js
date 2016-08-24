/**
* @Overview
*
* @Author: Daniel Goberitz
* @Date:               2016-08-24 01:55:45
* @Last Modified time: 2016-08-24 02:32:17
*/

'use strict';

var TEST_BASE_PATH;
const includeLib = require('../../moduleLoader');
describe('Customisation Specs', function() {

	beforeEach(function() {
		var path = require('path');

		TEST_BASE_PATH = path.resolve(__dirname + '/../');
		include.setBasePath(TEST_BASE_PATH);
	});

	it('should expose the base Strategies', function() {
		expect(typeof includeLib.AbstractStrategy).toBe('function', 'AbstractStrategy should be Present');

		expect(typeof includeLib.ModuleStrategy).toBe('function', 'ModuleStrategy should be Present');
		expect(includeLib.ModuleStrategy.prototype instanceof includeLib.AbstractStrategy).toBe(true);
		expect(typeof includeLib.ServiceStrategy).toBe('function', 'ServiceStrategy should be Present');
		expect(includeLib.ServiceStrategy.prototype instanceof includeLib.AbstractStrategy).toBe(true);

	});

	it('should expose a way to change the base path', function() {
		expect(typeof include.setBasePath).toBe('function');
	});

	it('should expose a way to change a kind of module!', function() {
		var moduleStrategy = include.getStrategy(includeLib.ModuleStrategy);

		// Stores the current templateDefinition
		var templateDef = moduleStrategy.getKindDefinition('template');

		expect(templateDef.kind).toBe('template');
		expect(templateDef.dirname).toBe('templates/');
		expect(templateDef.extension).toBe('.html');
		expect(typeof templateDef.loader).toBe('function');
		expect(templateDef.loader).not.toBe(require);

		// modify the kind template to be loaded as a require module
		moduleStrategy.removeKind('template');
		moduleStrategy.addKind('template', 'templates/'/*, '.js', require*/);

		var templateDefAfter = moduleStrategy.getKindDefinition('template');

		expect(templateDefAfter.kind).toBe('template');
		expect(templateDefAfter.dirname).toBe('templates/');
		expect(templateDefAfter.extension).toBe('');
		expect(templateDefAfter.loader).not.toBe(templateDef.loader);

		var m = include('module!TheCustomizedTemplateModule');
		expect(typeof m.template).toBe('function');

		moduleStrategy.removeKind('template');
		moduleStrategy.addKind(templateDef);

		expect(templateDef.kind).toBe('template');
		expect(templateDef.dirname).toBe('templates/');
		expect(templateDef.extension).toBe('.html');
		expect(typeof templateDef.loader).toBe('function');
		expect(templateDef.loader).not.toBe(require);

		var m2 = include('module!TheNotCustomizedTemplateModule');
		expect(typeof m2.template).toBe('string');

	});

});