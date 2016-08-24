/**
* @Overview
*
* @Author: Daniel Goberitz
* @Date:               2016-08-21 19:57:08
* @Last Modified time: 2016-08-24 02:04:36
*/

'use strict';

const Jasmine = require('jasmine');
const util = require('util');
const jasmine = new Jasmine();
const ConsoleReporter = require('jasmine/lib/reporters/console_reporter');

function log() {
	process.stdout.write('\x1B[1;36m!> ' + util.format.apply(util, arguments) + '\x1B[0m\n');
}

var ansi = {
	passed: '\x1B[32m',
	failed: '\x1B[31m',
	waiting: '\x1B[33m',
	unimplemented: '\x1B[35m',
	none: '\x1B[0m',
	u: '\x1B[4m',

	log: '\x1B[1;32m',
	info: '\x1B[1;36m',
	warn: '\x1B[1;33m',
};

function c(color, str) {
	return (ansi[color] + str + ansi.none);
}

function MyConsoleReporter(o) {
	this._letDefaultPrint = false;
	var me = this;
	o.print = function() {
		if(!!me._letDefaultPrint) {
			process.stdout.write(util.format.apply(this, arguments));
		}
	};
	ConsoleReporter.apply(this, arguments);

	this.suiteStarted = function(result) {
		process.stdout.write(this.tabs()  + ansi.u + result.description + ansi.none + '\n');
		this.tbs++;
	};

	var suD = this.specDone;
	this.suiteDone = function() {
		this.tbs--;
		process.stdout.write('\n');
		suD.apply(this, arguments);
	};

	this.buildConsoleQueueFor('log');
	this.buildConsoleQueueFor('info');
	this.buildConsoleQueueFor('warn');

	var spD = this.specDone;
	this.specDone = function(result) {
	    process.stdout.write(this.tabs());

		if(result.failedExpectations.length === 0 && result.passedExpectations.length === 0) {
	    	process.stdout.write('(U) ' + c('unimplemented', result.description));
		} else if (result.status == 'pending') {
	    	process.stdout.write('(W) ' + c('waiting', result.description));
	    } else if (result.status == 'passed') {
	    	process.stdout.write('(P) ' + c('passed', result.description));
		} else if (result.status == 'failed') {
	    	process.stdout.write('(F) ' + c('failed', result.description));
		}
	    process.stdout.write('\n');

	    this.printQueue();

		spD.apply(this, arguments);
	};

	this.tbs = 0;
	this.tabs = (extra) => {
		extra = !!extra ? extra : 0;
		var str = '';
		for(var i = 0; i < (this.tbs + extra); i++) {
			str+='  ';
		}
		return str;
	};

	var jD = this.jasmineDone;
	this.jasmineDone = function() {
		this._letDefaultPrint = true;
		jD.apply(this, arguments);
	};

}

MyConsoleReporter.prototype.buildConsoleQueueFor = function(method) {
	if(!this._queue) {
		this._queue = [];
	}
	var me = this;
	global.console[method] = function() {
		me._queue.push([method, arguments]);
	};
};

MyConsoleReporter.prototype.printQueue = function() {
	this._queue.forEach((data) => {
		var method = data[0];
		var args = data[1];

		process.stdout.write(
			this.tabs(1) + ansi[method] + util.format.apply(util, args).replace(/\n/g, '\n' +this.tabs(1)) + ansi.none +'\n'
		);
	});
	this._queue.splice(0);
};

util.inherits(MyConsoleReporter, ConsoleReporter);

var customReporter = new MyConsoleReporter({
	showColors: true,
	jasmineCorePath: jasmine.jasmineCorePath
});

jasmine.loadConfigFile('tests/config/jasmine.json');
jasmine.configureDefaultReporter({
    print: () => {}
});
jasmine.addReporter(customReporter);


jasmine.execute();