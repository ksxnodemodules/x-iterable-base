
((module) => {
	'use strict';

	var createClassFromSuper = require('simple-class-utils').createClass.super;
	var bind = require('simple-function-utils/bind').begin;
	var Root = require('./root.js').class;

	var _key_iterator = Symbol.iterator;

	module.exports = createClass;

	function createClass(Super = createClass.default, ...args) {

		class XIterable extends Super {

			* mapGenerator(callback) {
				for (let element of this) {
					yield callback(element, this);
				}
			}

			mapOnce(callback) {
				return new createClass.Yield(this.mapGenerator(callback));
			}

			map(callback) {
				return new createClass.AssignIterator(() => this.mapGenerator(callback));
			}

			* filterGenerator(callback) {
				for (let element of this) {
					if (callback(element, this)) {
						yield element;
					}
				}
			}

			filterOnce(callback) {
				return new createClass.Yield(this.filterGenerator(callback));
			}

			filter(callback) {
				return new createClass.AssignIterator(() => this.filterGenerator(callback));
			}

			runthrough() {
				for (let gen = this[_key_iterator](); !gen.next().done; );
			}

			forEach(callback) {
				for (let element of this) {
					callback(element, this);
				}
			}

			some(callback) {
				for (let element of this) {
					if (callback(element, this)) {
						return true;
					}
				}
				return false;
			}

			every(callback) {
				return !this.every((element) => !callback(element, this));
			}

			reduce(callback, init) {
				this.forEach((element) => {init = callback(init, element, this)});
				return init;
			}

            spread(callback = this.spread.DEFAULT_CALLBACK) {
                var self = this;
                return new createClass.AssignIterator(function * () {
                    for (let subsequence of self) {
                        yield * callback(subsequence, this);
                    }
                });
            }

			get sumAsNum() {
				return this.reduce((prev, now) => prev + Number(now), 0);
			}

			get productAsNum() {
				return this.reduce((prev, now) => prev * Number(now), 1);
			}

			get sumAsStr() {
				return this.reduce((prev, now) => prev + String(now), '');
			}

			get sumAsReservedStr() {
				return this.reduce((prev, now) => String(now) + prev, '');
			}

			most(callback, init) {
				for (let element of this) {
					if (callback(element, init, this)) {
						init = element;
					}
				}
				return init;
			}

			get min() {
				return this.most((challenger, champion) => challenger < champion, +Infinity);
			}

			get max() {
				return this.most((challenger, champion) => challenger > champion, -Infinity);
			}

			find(callback) {
				for (let element of this) {
					if (callback(element, this)) {
						return element;
					}
				}
			}

			search(callback) {
				for (let element of this) {
					if (callback(element, this)) {
						return new this.search.Result(element, this);
					}
				}
			}

		}

		((proto) => {

			proto.search.Result = class extends Root {
				constructor(value, object) {
					super();
					this.value = value;
					this.object = object;
				}
			};

			proto.spread.ITERABLES = (element) => element;
			proto.spread.DEFAULT_CALLBACK = proto.spread.ITERABLES;

			if (proto.has === undefined) {
				Object.assign(proto, {
					has(element, equal = this.equal.DEFAULT_EQUAL) {
						return this.some(bind(equal, element));
					}
				});
				proto.has.DEFAULT_EQUAL = Object.is;
			}

			var superproto = Object.getPrototypeOf(proto);

			makeMethodExists('join', function (...args) {
				return this.toArray().join(...args);
			});

			function makeMethodExists(fname, func) {
				if (typeof superproto[fname] !== 'function') {
					proto[fname] = func;
				}
			}

		})(XIterable.prototype);

		return createClassFromSuper(XIterable, ...args);

	}

	createClass.default = Root.IterableBased;

	createClass.fromGenerator = (gen, ...args) =>
		createClass(class extends createClass.fromGenerator.Root {
			constructor(...args) {
				super();
				this[_key_iterator] = (...rest) => gen.call(this, ...args, ...rest);
			}
		}, ...args);


	createClass.fromGenerator.Root = createClassFromSuper(Root);

	createClass.Yield = createClass.fromGenerator(function * (base) {
		yield * base;
	});

	createClass.AssignIterator = createClass(class extends Root {
		constructor(iterate) {
			super();
			this[_key_iterator] = iterate;
		}
	});

})(module);
