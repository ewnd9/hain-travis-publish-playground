# PluginContext.Logger
You can use this object instead of `console.log`.   
Logger object has a following function:
* **log(message)**
  - `message` Any - message (**required**)

  Logs your messages.  

>**Note:** You can see logging messages in `Chrome Developer Tools` in the app.  
>You can open `Chrome Developer Tools` by pressing <kbd>F12</kbd> in the app.

**Example**
```javascript
'use strict';

module.exports = (pluginContext) => {
  const logger = pluginContext.logger;
  
  function startup() {
    logger.log('startup');
  }
  function search(query, res) { ... }
  
  function execute(id, payload) {
    if (...) {
      logger.log('something is being executed');
    }
  }
  
  return { startup, search, execute };
};
```

## Related Docs
* [PluginContext](plugin-context.md)
