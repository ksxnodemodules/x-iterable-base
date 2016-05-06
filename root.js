
((module) => {
	'use strict';

	var createClass = require('simple-class-utils').createClass;

	var _key_iterator = Symbol.iterator;

	class RootClass {};

	module.exports = RootClass;

	RootClass.IterableBased = class extends RootClass {

		constructor(base) {
			super();
			this.base = base;
		}

		* [_key_iterator]() {
			yield * this.base;
		}

	}

})(module);
