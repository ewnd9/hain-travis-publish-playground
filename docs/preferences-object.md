# PreferencesObject

PreferencesObject extends `EventEmitter` and it has following functions:

* **get(path)**
  - `path` String - (optional, default is `undefined`)

  Returns raw preferences object if path is `undefined`, otherwise it returns the value at path of object, See `path` rules at <https://lodash.com/docs#get>

* **on(eventName, listener)**
  - `eventName` String - (**required**)
  - `listener` String - (**required**)
  
  Add a listener to PreferencesObject.  
  Currently, `update` event is supported only. and it will be emitted when plugin preferences has changed.

**Example**
```javascript
'use strict'

module.exports = (pluginContext) => {
  const prefObj = pluginContext.preferences;
  let useProxy = false;
  
  function onPrefUpdate(pref) {
    useProxy = pref.useProxy;
  }
  
  function startup() {
    useProxy = prefObj.get('useProxy');
    prefObj.on('update', onPrefUpdate);
  }
  
  function search(query, res) { ... }
  function execute(id, payload) { ... }
  
  return { startup, search, execute };
};
```

## Related Docs
* [PluginContext](plugin-context.md)