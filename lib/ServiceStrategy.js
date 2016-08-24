/**
* @Overview
*
* @Author: Daniel Goberitz
* @Date:               2016-08-22 20:45:04
* @Last Modified time: 2016-08-24 02:26:26
*/

'use strict';
const AbstractStrategy = require('./AbstractStrategy');

class ServiceStrategy extends AbstractStrategy {
	constructor(_handlerOps) {
		super(_handlerOps);
		this._baseDir = 'services';
	}
	getHandlers() {
		return ['service'];
	}
}

module.exports = ServiceStrategy;
