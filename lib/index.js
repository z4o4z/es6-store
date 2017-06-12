'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _symbol = require('core-js/es6/symbol');

var _symbol2 = _interopRequireDefault(_symbol);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var __ls = (0, _symbol2.default)('localStorage');
var __store = (0, _symbol2.default)('store');
var __window = (0, _symbol2.default)('window');
var __name = (0, _symbol2.default)('name');
var __isWriting = (0, _symbol2.default)('isWriting');
var __error = (0, _symbol2.default)('error');

function isWindowAndHasLS(window) {
  return window && window.localStorage;
}

function isValidObject(object) {
  return object && (typeof object === 'undefined' ? 'undefined' : _typeof(object)) === 'object' && !Array.isArray(object) && !(object instanceof Error);
}

function logError(err) {
  console.error(err);
}

function error(message) {
  return new Error(message);
}

function keyIsNotAString() {
  return error('key should be a string');
}

function isKeyAString(key) {
  return typeof key === 'string';
}

var Store = function () {
  _createClass(Store, null, [{
    key: 'serialize',

    /*
     * from object to string
     * @param {object}
     */
    value: function serialize(data) {
      return JSON.stringify(data);
    }

    /*
     * from string to object
     * @param {string}
     */

  }, {
    key: 'deserialize',
    value: function deserialize(string) {
      return JSON.parse(string);
    }

    /*
     * cone object
     * @param {obj}
     */

  }, {
    key: 'clone',
    value: function clone(obj) {
      return JSON.parse(JSON.stringify(obj));
    }

    /*
     * @param {string} name of local storage item
     */

  }]);

  function Store(name) {
    _classCallCheck(this, Store);

    if (!isWindowAndHasLS(window)) {
      return logError(error('window or localStorage is not defined!'));
    }

    this.version = '1.0.0';
    this[__window] = window;
    this[__name] = name;
    this[__isWriting] = false;
    this[__error] = null;
    this[__ls] = this[__window].localStorage;
    this[__store] = this.__getAndDeserialize();

    if (!isValidObject(this[__store])) {
      this[__store] = {};

      this.__serializeAndSet();

      if (this[__error]) {
        this.destructor(true);

        return this[__error];
      }
    }

    this.__changeStorageHandler = this.__changeStorageHandler.bind(this);

    this[__window].addEventListener('storage', this.__changeStorageHandler);
  }

  /*
   * Remove event listener
   * @param {boolean} if true, local storage item will be removed
   */


  _createClass(Store, [{
    key: 'destructor',
    value: function destructor(removeStorage) {
      this[__window].removeEventListener('storage', this.__changeStorageHandler);

      if (removeStorage) {
        this[__ls].removeItem(this[__name]);
      }

      delete this[__window];
      delete this[__name];
      delete this[__ls];
      delete this[__store];
      delete this[__isWriting];
    }

    /*
     * you can use multikey: set('boo.bar.baz', 10)
     * @param {string} value of key which you want set
     * @param {object|number|string|boolean} val which you want set
     */

  }, {
    key: 'set',
    value: function set(key, val) {
      if (!isKeyAString(key)) {
        return keyIsNotAString();
      }

      var store = this[__store];
      var _val = (typeof val === 'undefined' ? 'undefined' : _typeof(val)) === 'object' ? Store.clone(val) : val;
      var parts = key.split('.');
      var lastKey = parts.pop();

      if (typeof val === 'function') {
        _val = val();
      }

      if (_val === undefined) {
        return this.remove(key);
      }

      parts.forEach(function (_key) {
        if (!isValidObject(store[_key])) {
          store[_key] = {};
        }

        store = store[_key];
      });

      store[lastKey] = _val;

      this[__isWriting] = true;

      this.__serializeAndSet();

      if (this[__error]) {
        return this[__error];
      }

      return _val;
    }

    /*
     * you can use multikey: get('boo.bar.baz', 10)
     * @param {string} value of key which you want get
     * @param {object|number|string|boolean} defaultValue if key is undefined
     */

  }, {
    key: 'get',
    value: function get(key, defaultValue) {
      if (!arguments.length) {
        return this.getAll();
      }

      if (!isKeyAString(key)) {
        return keyIsNotAString();
      }

      var store = this[__store];
      var parts = key.split('.');
      var lastKey = parts.pop();

      for (var i = 0; i < parts.length; i += 1) {
        var _key = parts[i];

        if (store.hasOwnProperty(_key) && isValidObject(store[_key])) {
          store = store[_key];
        } else {
          return defaultValue;
        }
      }

      store = store[lastKey];

      if (store === undefined) {
        return defaultValue;
      }

      return (typeof store === 'undefined' ? 'undefined' : _typeof(store)) === 'object' ? Store.clone(store) : store;
    }

    /*
     * return all local storage data
     */

  }, {
    key: 'getAll',
    value: function getAll() {
      return Store.clone(this[__store]);
    }

    /*
     * you can use multikey: remove('boo.bar.baz')
     * @param {string} value of key which you want remove
     */

  }, {
    key: 'remove',
    value: function remove(key) {
      if (!arguments.length) {
        return this.clear();
      }

      if (!isKeyAString(key)) {
        return keyIsNotAString();
      }

      var store = this[__store];
      var parts = key.split('.');
      var lastKey = parts.pop();

      for (var i = 0; i < parts.length; i += 1) {
        var _key = parts[i];

        if (store.hasOwnProperty(_key) && isValidObject(store[_key])) {
          store = store[_key];
        } else {
          return undefined;
        }
      }

      var val = store[lastKey];

      delete store[lastKey];

      this.__serializeAndSet();

      if (this[__error]) {
        return this[__error];
      }

      return val;
    }

    /*
     * Clears local storage.
     */

  }, {
    key: 'clear',
    value: function clear() {
      var store = this[__store];

      this[__store] = {};
      this.__serializeAndSet();

      return store;
    }
  }, {
    key: '__getAndDeserialize',
    value: function __getAndDeserialize() {
      try {
        return Store.deserialize(this[__ls].getItem(this[__name]));
      } catch (e) {
        this[__error] = error('Error when trying to get data from localStorage!');

        logError(this[__error]);

        return this[__error];
      }
    }
  }, {
    key: '__serializeAndSet',
    value: function __serializeAndSet() {
      try {
        this[__ls].setItem(this[__name], Store.serialize(this[__store]));
        this[__error] = null;
      } catch (e) {
        this[__error] = error('Error when trying to set data to localStorage!');

        logError(this[__error]);
      }
    }
  }, {
    key: '__changeStorageHandler',
    value: function __changeStorageHandler(event) {
      if (event.key !== this[__name] || this[__isWriting]) {
        this[__isWriting] = false;
        return;
      }

      var store = this.__getAndDeserialize();

      if (!isValidObject(store)) {
        return;
      }

      this[__store] = store;
    }
  }]);

  return Store;
}();

exports.default = Store;
module.exports = exports['default'];