export default class Store {

  /*
   * @param {string} name of local storage item
   */

  constructor (name) {
    this.window = window;

    if (!this.window || !this.window.localStorage) {
      Helpers._logError(new Error("localStorage is not defined!"));

      return ;
    }

    this.name   = name;
    this.state  = null;
    this.ls     = this.window.localStorage;
    this.store  = this._getAndDeserialize();

    if (this.store === null || typeof this.store !== "object" || Array.isArray(this.store) || this.store instanceof Error) {
      this.store = {};
      this._serializeAndSet();
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
      this.ls.removeItem(this.name);
    }

    this.window = null;
    this.name   = null;
    this.ls     = null;
    this.store  = null;
    this.state  = null;
  }

  /*
   * you can use multikey: set('boo.bar.baz', 10)
   * @param {string} value of key which you want set
   * @param {object|number|string|boolean} val which you want set
   */

  set (key, val) {
    var store = this.store,
      parts = key.split('.'),
      _val = val;

    if (typeof key !== "string") {
      return ;
    }

    if (_val === undefined) {
      return this.store.remove(key)
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

    this.state = "writing";

    this._serializeAndSet();

    return _val;
  }

  /*
   * you can use multikey: get('boo.bar.baz', 10)
   * @param {string} value of key which you want get
   * @param {object|number|string|boolean} defaultValue if key is undefined
   */

  get (key, defaultValue) {
    var store = this.store,
      parts = key.split(".");

    for (let val of parts) {
      let _store = store[val];

      if (_store === undefined) { return defaultValue }

      store = _store;
    }

    return store === undefined ? defaultValue : store;
  }

  /*
   * return all local storage data
   */

  getAll () {
    return this.store;
  }

  /*
   * you can use multikey: remove('boo.bar.baz')
   * @param {string} value of key which you want remove
   */

  remove (key) {
    var store = this.store,
      parts = key.split('.'),
      val = undefined;

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

    this._serializeAndSet();

    return val;
  }

  _getAndDeserialize () {
    return Store.deserialize(this.ls.getItem(this.name));
  }

  _serializeAndSet () {
    this.ls.setItem(this.name, Store.serialize(this.store));
  }

  _changeStorageHandler (event) {
    if (event.key !== this.name || this.state === "writing") {
      return this.state = null;
    }

    this.store = this._getAndDeserialize();
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
      Helpers._logError(e);
      return e;
    }
  }

  static _logError (error) {
    console.error(error);
  }
}