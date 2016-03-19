# PluginContext.Toast
You can show notifications to user by using Toast.  
Toast object has a following function:
* **enqueue(message, duration)**
  - `message` String - notification message (**required**)
  - `duration` Number - notification duration in milliseconds (optional, default is `2000`)

  You can enqueue your notifications by using this function.  

>**Note:** Enqueued notifications are processed in order. and will not be processed during the window isn't visible.

**Example**
```javascript
'use strict';

module.exports = (pluginContext) => {
  const toast = pluginContext.toast;
  
  function startup() { ... }
  function search(query, res) { ... }
  
  function execute(id, payload) {
    if (...) {
      toast.enqueue('Hello, World!', 2500);
    }
  }
  
  return { startup, search, execute };
};
```

## Related Docs
* [PluginContext](plugin-context.md)
