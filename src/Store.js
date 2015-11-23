export default class Store {

  /*
   * @param {string} name of local storage item
   */

  constructor (name) {
    var store;

    this.window = window;

    if (!this.window || !this.window.localStorage) {
      Store._logError(new Store._Error("localStorage is not defined!"));

      return ;
    }

    this._name   = name;
    this._state  = null;
    this._ls     = this.window.localStorage;

    store = this._getAndDeserialize();

    if (store instanceof Error) {
      return;
    }

    this._store = store;

    if (this._store === null || typeof this._store !== "object" || Array.isArray(this._store) || this._store instanceof Error) {
      this._store = {};

      if (!this._serializeAndSet()) {
        Store._logError(new Store._Error("Error when trying to set data to localStorage!"));

        return;
      }
    }

    this._changeStorageHandler = this._changeStorageHandler.bind(this);

    this.window.addEventListener("storage", this._changeStorageHandler);
  }

  /*
   * Remove event listener
   * @param {boolean} if true, local storage item will be removed
   */

  destructor (removeStorage) {
    if (this.window === undefined) { return; }

    this.window.removeEventListener("storage", this._changeStorageHandler);

    if (removeStorage) {
      this._ls.removeItem(this._name);
    }

    this.window = null;
    this._name   = null;
    this._ls     = null;
    this._store  = null;
    this._state  = null;
  }

  /*
   * you can use multikey: set('boo.bar.baz', 10)
   * @param {string} value of key which you want set
   * @param {object|number|string|boolean} val which you want set
   */

  set (key, val) {
    var store = this._store,
      parts = key.split('.'),
      _val = val === "object" ? Store.clone(val) : val;

    if (typeof key !== "string") {
      return Store._Error("key should be a string");
    }

    if (_val === undefined) {
      return this._store.remove(key)
    }

    if (typeof val === "function") {
      _val = val();
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

    this._state = "writing";

    if (!this._serializeAndSet()) {
      return new Store._Error("Error when trying to set data to localStorage!")
    }

    return _val;
  }

  /*
   * you can use multikey: get('boo.bar.baz', 10)
   * @param {string} value of key which you want get
   * @param {object|number|string|boolean} defaultValue if key is undefined
   */

  get (key, defaultValue) {
    var store = this._store,
      parts = key.split(".");

    if (typeof key !== "string") {
      return Store._Error("key should be a string");
    }

    for (let val of parts) {
      let _store = store[val];

      if (_store === undefined) { return defaultValue }

      store = _store;
    }

    if (store === undefined ) {
      return defaultValue;
    }

    return store === "object" ? Store.clone(store) : store;
  }

  /*
   * return all local storage data
   */

  getAll () {
    return Store.clone(this._store);
  }

  /*
   * you can use multikey: remove('boo.bar.baz')
   * @param {string} value of key which you want remove
   */

  remove (key) {
    var store = this._store,
      parts = key.split('.'),
      val = undefined;

    if (typeof key !== "string") {
      return Store._Error("key should be a string");
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

    if (!this._serializeAndSet()) {
      return new Store._Error("Error when trying to set data to localStorage!")
    }

    return val;
  }

  _getAndDeserialize () {
    return Store.deserialize(this._ls.getItem(this._name));
  }

  _serializeAndSet () {
    try {
      this._ls.setItem(this._name, Store.serialize(this._store));
      return true;
    } catch (e) {
      return false;
    }
  }

  _changeStorageHandler (event) {
    if (event.key !== this._name || this._state === "writing") {
      return this._state = null;
    }

    var store = this._getAndDeserialize();

    if (store instanceof Error) {
      return;
    }

    this._store = store;
  }

  /*
   * Clears local storage.
   */
  
  clear () {
    this.store = {};
    this._serializeAndSet();
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
    if (typeof string !== "string") { return undefined; }

    // try to parse string
    try {
      return JSON.parse(string)
    } catch(e) {
      Store._logError(e);
      return e;
    }
  }

  /*
   * cone object
   * @param {obj}
   */

  static clone (obj) {
    return JSON.parse(JSON.stringify(obj))
  }

  static _logError (error) {
    console.error(error);
  }

  static _Error (message) {
    return new Error(message);
  }
}