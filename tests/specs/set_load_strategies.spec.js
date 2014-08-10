/* 
 * 
 *  @overview 
 *  @author Daniel Goberitz <dalgo86@gmail.com>
 * 
 */
var TEST_BASE_PATH;
var fs = require('fs');
describe('Module Internal Specs', function(){
	
	beforeEach(function(){
		var path = require('path');
		require('../../moduleLoader');

		TEST_BASE_PATH = path.resolve(__dirname + '/../');
		include.setBasePath(TEST_BASE_PATH);
	});
	
	it('Should\'t throw an exception when the user wants to modify an existing strategy', function(){
		var fs = require('fs');
		var toTry = function(){
			include.setKind('template', function(filename){
				return fs.readFileSync(filename, {encoding: 'utf8'});
			}, '.html');
		};
		
		expect(toTry).not.toThrow();

		var fakeTemplateModule = include('module!TheTemplateModule');
		var template = fs.readFileSync(TEST_BASE_PATH + '/modules/TheTemplateModule/templates/aTemplate.html', {encoding: 'utf8'});

		expect(fakeTemplateModule.template).toEqual(template);

	});

	it('Should throw an exception when the user wants to create a strategy without extension and dirname', function(){
		var fs = require('fs');
		var toTry = function(){
			include.setKind('kind1', 'require');
		};
		
		expect(toTry).toThrow();
	});

	it('Should throw an exception when the user try to use include as loader (prevents circular callings)', function(){
		include.setKind('model', 'include');
		var toTry = function(){
			include('module!AnotherModule');
		};
		expect(toTry).toThrow();
		include.setKind('model', 'require');
	});
 
	it('Should accept a new strategy', function(){
		include.setKind(
			'weirdKind', 
			function(filename){
				return JSON.parse(fs.readFileSync(filename, {encoding: 'utf8'}));
			}, 
			'.json', 
			'weirdos/'
		);
		
		
		var fakeTestModule = include('module!TheCustomModule');
		var weirdKind = JSON.parse(fs.readFileSync(TEST_BASE_PATH + '/modules/TheCustomModule/weirdos/aWeirdKindObject.json', {encoding: 'utf8'}));

		expect(fakeTestModule.weirdKind).toEqual(weirdKind);
		
	});
});
 