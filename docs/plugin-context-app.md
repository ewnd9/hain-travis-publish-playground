# PluginContext.App
App object has following functions:
* **restart()**
 
  Restart the app
  
* **quit()**

  Quit the app
  
* **close()**

  Close the open window
  
* **setInput(text)**
  - `text` String - New input(query) (**required**)

  Change user input (similar with `redirect` property in `SearchResult`)

**Example**
```javascript
'use strict'

module.exports = (pluginContext) => {
  const app = pluginContext.app;
  
  function startup() { ... }
  function search(query, res) { ... }
  
  function execute(id, payload) {
    if ( ... ) {
      app.restart();
    }
  }
  
  return { startup, search, execute };
};
```

## Related Docs
* [PluginContext](plugin-context.md)

