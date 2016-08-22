/**
* @Overview
*
* @Author: Daniel Goberitz
* @Date:               2016-08-20 00:02:48
* @Last Modified time: 2016-08-22 19:35:52
*/
'use strict';

var TEST_BASE_PATH;
var path = require('path');
describe('Module Internal Specs', function(){

	beforeEach(function(){
		require('../../moduleLoader');

		TEST_BASE_PATH = path.resolve(__dirname + '/../');
		include.setBasePath(TEST_BASE_PATH);
	});

	it('Should throw an exception when the user ask for a model outside a module environment', function(){
		var toTry = function(){
			include('model!Amodel');
		};

		expect(include.getBasePath()).toEqual(TEST_BASE_PATH);
		var expectedURI = path.relative(TEST_BASE_PATH, __filename).replace(/\\/g, '/').trim();

		expect(toTry).toThrowError(Error, `modulesloader: ERROR Resolving: 'model!Amodel' | URIError: model!Amodel unreachable from ${expectedURI}`);
	});

	it('Should get the module', function(){
		var fakeTestModule = include('module!TheMassiveModule');

		expect(fakeTestModule.model._FAKE_TEST_ID_).toEqual('TheMassiveModule/aModel');
		expect(fakeTestModule.model.subModel._FAKE_TEST_ID_).toEqual('TheMassiveModule/subModels/subModel');
		expect(fakeTestModule.model.subModel.siblingModel._FAKE_TEST_ID_).toEqual('TheMassiveModule/subModels/siblingModel');

		expect(fakeTestModule.view._FAKE_TEST_ID_).toEqual('TheMassiveModule/aView');

		expect(fakeTestModule.template).toEqual('<html><body>a template</body></html>');

		expect(fakeTestModule.helper._FAKE_TEST_ID_).toEqual('TheMassiveModule/aHelper');

		expect(fakeTestModule.widget._FAKE_TEST_ID_).toEqual('TheMassiveModule/aWidget');
	});
});
