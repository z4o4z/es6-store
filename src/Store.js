let ls          = Symbol('localStorage');
let store       = Symbol('store');
let name        = Symbol('name');
let isWriting   = Symbol('isWriting');

export default class Store {

  /*
   * @param {string} name of local storage item
   */

  constructor (name) {
    var store;

    this.window = window;

    if (!this.window || !this.window.localStorage) {
      Store.__logError(new Store.__error("localStorage is not defined!"));

      return ;
    }

    this[name]       = name;
    this[isWriting]  = false;
    this[ls]        = this.window.localStorage;

    store = this.__getAndDeserialize();

    if (store instanceof Error) {
      return;
    }

    this[store] = store;

    if (this[store] === null || typeof this[store] !== "object" || Array.isArray(this[store]) || this[store] instanceof Error) {
      this[store] = {};

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

  destructor (removeStorage) {
    if (this.window === undefined) { return; }

    this.window.removeEventListener("storage", this.__changeStorageHandler);

    if (removeStorage) {
      this[ls].removeItem(this[name]);
    }

    this.window     = null;
    this[name]       = null;
    this[ls]        = null;
    this[store]     = null;
    this[isWriting]  = false;
  }

  /*
   * you can use multikey: set('boo.bar.baz', 10)
   * @param {string} value of key which you want set
   * @param {object|number|string|boolean} val which you want set
   */

  set (key, val) {
    var store = this[store],
      parts = key.split('.'),
      _val = typeof val === "object" ? Store.clone(val) : val;

    if (typeof key !== "string") {
      return Store.__error("key should be a string");
    }

    if (typeof val === "function") {
      _val = val();
    }

    if (_val === undefined) {
      return this[store].remove(key)
    }

    for (let i = 0, length = parts.length; i < length; i += 1) {
      if (typeof store[parts[i]] === "undefined") {
        store[parts[i]] = {};
      }

      if (i !== length - 1) {
        store = store[parts[i]];
      } else {
        store[parts[i]] = _val;
      }
    }

    this[isWriting] = true;

    if (!this.__serializeAndSet()) {
      return new Store.__error("Trying to set data in localStorage is failed!")
    }

    return _val;
  }

  /*
   * you can use multikey: get('boo.bar.baz', 10)
   * @param {string} value of key which you want get
   * @param {object|number|string|boolean} defaultValue if key is undefined
   */

  get (key, defaultValue) {
    var store = this[store],
      parts = key.split(".");

    if (typeof key !== "string") {
      return Store.__error("key should be a string");
    }

    for (let val in parts) {
      if (parts.hasOwnProperty(val)) {
        let _store = store[val];

        if (_store === undefined) { return defaultValue }

        store = _store;
      }
    }

    if (store === undefined ) {
      return defaultValue;
    }

    return typeof store === "object" ? Store.clone(store) : store;
  }

  /*
   * return all local storage data
   */

  getAll () {
    return Store.clone(this[store]);
  }

  /*
   * you can use multikey: remove('boo.bar.baz')
   * @param {string} value of key which you want remove
   */

  remove (key) {
    var store = this[store],
      parts = key.split('.'),
      val = undefined;

    if (typeof key !== "string") {
      return Store.__error("key should be a string");
    }

    for (let i = 0; i < parts.length; i += 1) {
      if (typeof store[parts[i]] === "undefined") {
        return;
      }

      if (i !== parts.length - 1) {
        store = store[parts[i]];
      } else {
        val = store[parts[i]];
        delete store[parts[i]];
      }
    }

    if (!this.__serializeAndSet()) {
      return new Store.__error("Trying to set data in localStorage is failed!")
    }

    return val;
  }

  __getAndDeserialize () {
    return Store.deserialize(this[ls].getItem(this[name]));
  }

  __serializeAndSet () {
    try {
      this[ls].setItem(this[name], Store.serialize(this[store]));
      return true;
    } catch (e) {
      return false;
    }
  }

  __changeStorageHandler (event) {
    if (event.key !== this[name] || this[isWriting]) {
      return this[isWriting] = false;
    }

    var store = this.__getAndDeserialize();

    if (store instanceof Error) {
      return;
    }

    this[store] = store;
  }

  /*
   * Clears local storage.
   */
  
  clear () {
    this.store = {};
    this.__serializeAndSet();
  }

  /*
   * from object to string
   * @param {object}
   */

  static serialize (data) {
    return JSON.stringify(data);
  }

  /*
   * from string to object
   * @param {string}
   */

  static deserialize (string) {
    if (typeof string !== "string") { return; }

    // try to parse string
    try {
      return JSON.parse(string)
    } catch(e) {
      Store.__logError(e);
      return e;
    }
  }

  /*
   * cone object
   * @param {obj}
   */

  static clone (obj) {
    return Object.assign({}, obj);
  }

  static __logError (error) {
    console.error(error);
  }

  static __error (message) {
    return new Error(message);
  }
}