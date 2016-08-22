/**
* @Overview
*
* @Author: Daniel Goberitz
* @Date:               2016-08-22 20:45:04
* @Last Modified time: 2016-08-22 20:47:55
*/

'use strict';
const AbstractStrategy = require('./AbstractStrategy');

class ServiceStrategy extends AbstractStrategy {
	constructor() {
		super();
		this._baseDir = 'services';
	}
	getHandlers() {
		return ['service'];
	}
}

module.exports = ServiceStrategy;
