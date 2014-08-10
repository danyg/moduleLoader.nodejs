/* 
 * 
 *  @overview 
 *  @author Daniel Goberitz <dalgo86@gmail.com>
 * 
 */
var TEST_BASE_PATH;
describe('Normal module test', function(){
	beforeEach(function(){
		var path = require('path');
		require('../../moduleLoader');

		TEST_BASE_PATH = path.resolve(__dirname + '/../');
		include.setBasePath(TEST_BASE_PATH);
	});
	
	it('require modulesloader should register include function in global scope (API TEST)', function(){
		var ret = require('../../moduleLoader');

		expect(typeof include).toEqual('function');
		expect(typeof include.resolve).toEqual('function');
		expect(typeof include.getBasePath).toEqual('function');
		expect(typeof include.setBasePath).toEqual('function');
		
		expect(typeof include.setKind).toEqual('function');
	});
	
	it('include.setBasePath changes the base Path', function(){
		var toPath = process.cwd();
		expect(include.getBasePath()).not.toEqual(toPath);
		include.setBasePath(toPath);
		expect(include.getBasePath()).toEqual(toPath);
	});
	
	it('include.resolve for a module should return the proper path', function(){
		expect(include.resolve('module!ModuleName')).toEqual('modules/ModuleName/controllers/ModuleName');
	});

	it('include.resolve for a service should return the proper path', function(){
		expect(include.resolve('service!ServiceName')).toEqual('services/ServiceName/ServiceName');
	});
	
});
describe('Normal service test', function(){
	
	it('A service is reachable', function(){
		var service = include('service!aService');
		
		expect(service._FAKE_TEST_ID_).toEqual('aService');
		expect(service.something._FAKE_TEST_ID_).toEqual('aService/something');
	});

	it('A BadService is reachable', function(){
		var toThrow = function(){
			include('service!aBadService');
		};
		
		expect(toThrow).toThrow();
	});
	
});
