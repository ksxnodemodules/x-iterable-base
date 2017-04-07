'use strict'

const {iterator} = Symbol

class RootClass {};

module.exports = RootClass

RootClass.IterableBased = class extends RootClass {
  constructor (base) {
    super()
    this.base = base
  }
  * [iterator ] () {
    yield * this.base
  }
}

RootClass.prototype[Symbol.toStringTag] = 'XIterable'
