# PluginContext.Logger
You can use this object instead of `console.log`.   
Logger object has a following function:
* **log(message)**
  - `message` Any - message (**required**)

  Logs your messages.  

>**Note:** You can find logging messages in `plugins.log` file in the app directory.


>**Note:** You can see logging messages in the command prompt if you run Hain in the command prompt.
  

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
