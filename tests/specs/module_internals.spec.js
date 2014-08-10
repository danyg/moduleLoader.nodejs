/* 
 * 
 *  @overview 
 *  @author Daniel Goberitz <dalgo86@gmail.com>
 * 
 */
var TEST_BASE_PATH;
describe('Module Internal Specs', function(){
	
	beforeEach(function(){
		var path = require('path');
		require('../../moduleLoader');

		TEST_BASE_PATH = path.resolve(__dirname + '/../');
		include.setBasePath(TEST_BASE_PATH);
	});
	
	it('Should throw an exception when the user ask for a model outside a module environment', function(){
		var toTry = function(){
			include('model!Amodel');
		};
		
		expect(include.getBasePath()).toEqual(TEST_BASE_PATH);
		
		expect(toTry).toThrow('modulesloader: ERROR Resolving: \'model!Amodel\' | URIError: model!Amodel unreachable from ' + TEST_BASE_PATH);
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
 