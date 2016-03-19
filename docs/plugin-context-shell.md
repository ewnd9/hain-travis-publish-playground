# PluginContext.Shell
Shell object has following functions:
* **openItemInFolder(fullPath)**
  - `fullPath` String - (**required**)

  Show the given file in a file manager.
* **openItem(fullPath)**
  - `fullPath` String - (**required**)

  Open the given file in the desktop's default manner.

* **openExternal(fullPath)**
  - `fullPath` String - (**required**)

  Open the given external protocol URL in the desktop's default manner.

**Example**
```javascript
'use strict'

module.exports = (pluginContext) => {
  const shell = pluginContext.shell;
  
  function startup() { ... }
  function search(query, res) { ... }
  
  function execute(id, payload) {
    if ( ... ) {
      shell.openExternal('https://www.google.com/');
    }
  }
  
  return { startup, search, execute };
};
```

## Related Docs
* [PluginContext](plugin-context.md)

