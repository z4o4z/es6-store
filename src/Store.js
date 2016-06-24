let __ls = Symbol('localStorage');
let __store = Symbol('store');
let __name = Symbol('name');
let __isWriting = Symbol('isWriting');

export default class Store {

  /*
   * @param {string} name of local storage item
   */

  constructor(name) {
    let store;

    this.window = window;

    if (!this.window || !this.window.localStorage) {
      return Store.__logError(new Store.__error("localStorage is not defined!"));
    }

    this[__name] = name;
    this[__isWriting] = false;
    this[__ls] = this.window.localStorage;

    store = this.__getAndDeserialize();

    if (store instanceof Error) {
      return;
    }

    this[__store] = store;

    if (this[__store] === null || typeof this[__store] !== "object" || Array.isArray(this[__store]) || this[__store] instanceof Error) {
      this[__store] = {};

      if (!this.__serializeAndSet()) {
        Store.__logError(new Store.__error("Error when trying to set data to localStorage!"));

        return;
      }
    }

    this.__changeStorageHandler = this.__changeStorageHandler.bind(this);

    this.window.addEventListener("storage", this.__changeStorageHandler);
  }

  /*
   * Remove event listener
   * @param {boolean} if true, local storage item will be removed
   */

  destructor(removeStorage) {
    if (this.window === undefined) {
      return;
    }

    this.window.removeEventListener("storage", this.__changeStorageHandler);

    if (removeStorage) {
      this[__ls].removeItem(this[__name]);
    }

    this.window = null;
    this[__name] = null;
    this[__ls] = null;
    this[__store] = null;
    this[__isWriting] = false;
  }

  /*
   * you can use multikey: set('boo.bar.baz', 10)
   * @param {string} value of key which you want set
   * @param {object|number|string|boolean} val which you want set
   */

  set(key, val) {
    let store = this[__store];
    let parts = key.split('.');
    let _val = typeof val === "object" ? Store.clone(val) : val;

    if (typeof key !== "string") {
      return Store.__error("key should be a string");
    }

    if (typeof val === "function") {
      _val = val();
    }

    if (_val === undefined) {
      return this[__store].remove(key);
    }

    for (let i = 0, length = parts.length; i < length; i += 1) {
      if (typeof store[parts[i]] === "undefined") {
        store[parts[i]] = {};
      }

      if (i === length - 1) {
        store[parts[i]] = _val;
      } else {
        store = store[parts[i]];
      }
    }

    this[__isWriting] = true;

    if (!this.__serializeAndSet()) {
      return new Store.__error("Trying to set data in localStorage is failed!");
    }

    return _val;
  }

  /*
   * you can use multikey: get('boo.bar.baz', 10)
   * @param {string} value of key which you want get
   * @param {object|number|string|boolean} defaultValue if key is undefined
   */

  get(key, defaultValue) {
    let store = this[__store];
    let parts = key.split(".");

    if (typeof key !== "string") {
      return Store.__error("key should be a string");
    }

    for (let val in parts) {
      if (parts.hasOwnProperty(val)) {
        let _store = store[val];

        if (_store === undefined) {
          return defaultValue;
        }

        store = _store;
      }
    }

    if (store === undefined) {
      return defaultValue;
    }

    return typeof store === "object" ? Store.clone(store) : store;
  }

  /*
   * return all local storage data
   */

  getAll() {
    return Store.clone(this[__store]);
  }

  /*
   * you can use multikey: remove('boo.bar.baz')
   * @param {string} value of key which you want remove
   */

  remove(key) {
    let store = this[__store];
    let parts = key.split('.');
    let val;

    if (typeof key !== "string") {
      return Store.__error("key should be a string");
    }

    for (let i = 0; i < parts.length; i += 1) {
      if (typeof store[parts[i]] === "undefined") {
        return;
      }

      if (i === parts.length - 1) {
        val = store[parts[i]];
        delete store[parts[i]];
      } else {
        store = store[parts[i]];
      }
    }

    if (!this.__serializeAndSet()) {
      return Store.__error("Trying to set data in localStorage is failed!");
    }

    return val;
  }

  __getAndDeserialize() {
    return Store.deserialize(this[__ls].getItem(this[__name]));
  }

  __serializeAndSet() {
    try {
      this[__ls].setItem(this[__name], Store.serialize(this[__store]));
      return true;
    } catch (e) {
      return false;
    }
  }

  __changeStorageHandler(event) {
    if (event.key !== this[__name] || this[__isWriting]) {
      this[__isWriting] = false;
      return;
    }

    var store = this.__getAndDeserialize();

    if (store instanceof Error) {
      return;
    }

    this[__store] = store;
  }

  /*
   * Clears local storage.
   */

  clear() {
    this.store = {};
    this.__serializeAndSet();
  }

  /*
   * from object to string
   * @param {object}
   */

  static serialize(data) {
    return JSON.stringify(data);
  }

  /*
   * from string to object
   * @param {string}
   */

  static deserialize(string) {
    if (typeof string !== "string") {
      return;
    }

    // try to parse string
    try {
      return JSON.parse(string);
    } catch (e) {
      Store.__logError(e);
      return e;
    }
  }

  /*
   * cone object
   * @param {obj}
   */

  static clone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  static __logError(error) {
    console.error(error);
  }

  static __error(message) {
    return new Error(message);
  }
}
