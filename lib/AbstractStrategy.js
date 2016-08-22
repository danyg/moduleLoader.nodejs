/**
* @Overview
*
* @Author: Daniel Goberitz
* @Date:               2016-08-22 20:00:57
* @Last Modified time: 2016-08-22 20:39:34
*/

'use strict';

class AbstractStrategy {
	constructor() {
		if(this.constructor.name === 'AbstractStrategy') {
			throw new Error('AbstractStrategy is Abstract you can\'t instantiate an abstract class');
		}
		this._baseDir = '';

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

	load(filePath) {
		return require(filePath);
	}
}

module.exports = AbstractStrategy;
