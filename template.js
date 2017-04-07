'use strict'

const createClassFromSuper = require('simple-class-utils').createClass.super
const bind = require('simple-function-utils/bind').begin
const Root = require('./root.js')
const {iterator} = Symbol
const {is} = Object

module.exports = XIterable

function XIterable (Super = XIterable.default, ...args) {
  class XIterable extends Super {
    * mapGenerator (callback) {
      for (let element of this) {
        yield callback(element, this)
      }
    }

    mapOnce (callback) {
      const gen = this.mapGenerator(callback)
      return {
        [iterator]: () => gen,
        __proto__: this
      }
    }

    map (callback) {
      return {
        [iterator]: () => this.mapGenerator(callback),
        __proto__: this
      }
    }

    * filterGenerator (callback) {
      for (let element of this) {
        if (callback(element, this)) {
          yield element
        }
      }
    }

    filterOnce (callback) {
      const gen = this.filterGenerator(callback)
      return {
        [iterator]: () => gen,
        __proto__: this
      }
    }

    filter (callback) {
      return {
        [iterator]: () => this.filterGenerator(callback),
        __proto__: this
      }
    }

    runthrough () {
      for (let gen = this[iterator](); !gen.next().done;);
    }

    forEach (callback) {
      for (let element of this) {
        callback(element, this)
      }
    }

    some (callback) {
      for (let element of this) {
        if (callback(element, this)) {
          return true
        }
      }
      return false
    }

    every (callback) {
      return !this.some((element) => !callback(element, this))
    }

    reduce (callback, init) {
      this.forEach((element) => { init = callback(init, element, this) })
      return init
    }

    spread (callback = this.spread.DEFAULT_CALLBACK) {
      const self = this
      return {
        * [ iterator ] () {
          for (let subsequence of self) {
            yield * callback(subsequence, this)
          }
        },
        __proto__: this
      }
    }

    get sumAsNum () {
      return this.reduce((prev, now) => prev + Number(now), 0)
    }

    get productAsNum () {
      return this.reduce((prev, now) => prev * Number(now), 1)
    }

    get sumAsStr () {
      return this.reduce((prev, now) => prev + String(now), '')
    }

    get sumAsReservedStr () {
      return this.reduce((prev, now) => String(now) + prev, '')
    }

    most (callback, init) {
      for (let element of this) {
        if (callback(element, init, this)) {
          init = element
        }
      }
      return init
    }

    get min () {
      return this.most((challenger, champion) => challenger < champion, +Infinity)
    }

    get max () {
      return this.most((challenger, champion) => challenger > champion, -Infinity)
    }

    find (callback) {
      for (let element of this) {
        if (callback(element, this)) {
          return element
        }
      }
    }

    search (callback) {
      for (let element of this) {
        if (callback(element, this)) {
          return new this.search.Result(element, this)
        }
      }
    }

    has (element, equal = is) {
      return Boolean(this.search(bind(equal, element)))
    }
  }

  (proto => {
    proto.search.Result = class extends Root {
      constructor (value, object) {
        super()
        this.value = value
        this.object = object
      }
    }

    proto.spread.ITERABLES = (element) => element
    proto.spread.DEFAULT_CALLBACK = proto.spread.ITERABLES
    const superproto = Object.getPrototypeOf(proto)

    makeMethodExists('join', function (...args) {
      return this.toArray().join(...args)
    })

    function makeMethodExists (fname, func) {
      if (typeof superproto[fname] !== 'function') {
        proto[fname] = func
      }
    }
  })(XIterable.prototype)

  return createClassFromSuper(XIterable, ...args)
}

XIterable.default = Root.IterableBased
XIterable.fromGenerator = (gen, ...args) =>
  XIterable(class extends XIterable.fromGenerator.Root {
    constructor (...args) {
      super()
      this[iterator] = (...rest) => gen.call(this, ...args, ...rest)
    }
  }, ...args)

XIterable.fromGenerator.Root = createClassFromSuper(Root)

XIterable.Yield = XIterable.fromGenerator(function * (base) {
  yield * base
})

XIterable.AssignIterator = XIterable(class extends Root {
  constructor (iterate) {
    super()
    this[iterator] = iterate
  }
})
