/**
* @Overview
*
* @Author: Daniel Goberitz
* @Date:               2016-08-22 20:00:57
* @Last Modified time: 2016-08-24 02:00:57
*/

'use strict';

class AbstractStrategy {
	constructor(handlerOps) {
		this._handlerOps = handlerOps;
		if(this.constructor.name === 'AbstractStrategy') {
			throw new Error('AbstractStrategy is Abstract you can\'t instantiate an abstract class');
		}
		this._baseDir = '';
		this._registered = false;
	}

	getBaseDir() {
		return this._baseDir;
	}

	resolve(kind, moduleName) {
		return this._baseDir + '/' + moduleName + '/' + moduleName;
	}

	getHandlers() {
		return [this.constructor.name];
	}

	load(filePath/*, kind, moduleName*/) {
		return require(filePath);
	}

	registered(){
		this._registered = true;
	}
	_isRegistered() {
		return this._registered;
	}
}

module.exports = AbstractStrategy;
