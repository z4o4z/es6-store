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
* [`store.get`][get]
* [`store.getAll`][getAll]
* [`store.remove`][remove]
* [`store.destructor`][destructor]

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