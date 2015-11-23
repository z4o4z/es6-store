# es6-store

> A simple localstorage api with uses ES6 classes. 
  This library saves data from localstorage in local variable and syncs this variable with localstorage.
  When you try to get data, library doesn't read localstorage it just returns data from local variable.

## Install

`npm i es6-store --save`

## How to use

Just import `Store` from Store.js if you use ES6 

##### Example

`import Store from 'node_module/es6-store/src/Store.js'`

Just require `es6-store` if you use browserify

##### Example

`var Store = require(es6-store);`

Create instance of Store

##### Example

`var store = new Store('NameOfYourStore')`

## API

* [`store.set`](#storeset)
* [`store.get`](#storeget)
* [`store.getAll`](#storegetall)
* [`store.remove`](#storeremove)
* [`store.clear`](#storeclear)
* [`store.destructor`](#storedestructor)
* [`Store.serialize`](#storeserialize)
* [`Store.deserialize`](#storedeserialize)
* [`Store.clone`](#storeclone)

### `store.set`

Persists `value` under `key` in local storage.
Key will be removed if `value` is `undefined`.
You can use multi key!

##### Returns
 1. An error if `key` isn't `string` or set failed.
 2. Set `value` or remote `value`

##### Example

    store.set('foo', 'bar');
    -> 'bar'
    store.set('bar.baz', 'bar');
    -> 'bar'
    store.getAll();
    -> 
      {
        foo: 'bar',
        bar: {
          baz: 'bar'
        }
      }

### `store.get`

Return `value` under `key` in local storage.
Will be return `defaultValue` if `key`  is not defined.
You can use multi key!

##### Returns
 1. An error if `key` isn't `string` or set failed.
 2. `value` under `key` or `defaultValue`.

##### Example

    store.get('foo');
    -> 'bar'
    store.get('bar.baz');
    -> 'bar'
    store.get('baz', 'bar'); // baz is not defined
    -> 'bar'

### `store.getAll`

Return local storage object.

##### Returns
 1. local storage object.

##### Example

    store.getAll();
    -> 
      {
        foo: 'bar',
        bar: {
          baz: 'bar'
        }
      }

### `store.remove`

Removes `key` from local storage.
You can use multi key!

##### Returns
 1. An error if `key` isn't `string` or remove failed.
 2. `undefined` if `key` is not defined.
 3. `value` of removed `key`.

##### Example

    store.remove('foo');
    -> 'bar'
    store.remove('bar.baz');
    -> 'bar'
    store.get('baz', 'bar'); // baz is not defined
    -> undefined

### `store.clear`

Clear local storage object.

##### Returns
 1. `undefined`.

### `store.destroy`

Remove event listener.
If first argument is `true`, local storage item will be removed

##### Returns
 1. `undefined`.

### `Store.serialize`

Static method.
Convert from JSON to string. 

### `Store.deserialize`

Static method.
Convert from string to JSON. 

### `Store.clone`

Static method.
Clone object. Use JSON.stringify and JSON.parse.