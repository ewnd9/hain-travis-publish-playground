#How to make plugins

You can easily write your own hain plugin in JavaScript.

Basically, a hain plugin is just a nodejs module itself.



## Hello, World

Following is describing a basic structure of a plugin module.

### package.json

```json
{
  "name": "hain-plugin-helloworld",
  "version": "0.0.1",
  "description": "a basic example of hain plugin",
  "main": "index.js",
  "hain": {                         // Hain options (Required)
    "prefix": "/hello",             // String || null (required)
    "usage": "you can put /hello",  // String (optional)
    "icon": "#fa fa-heart"          // String (required)
    "redirect": "/helloworld"       // String (optional)
  }
}
```

### index.js

```javascript
'use strict';

module.exports = (pluginContext) => {
  function startup() {
    // you can initialize your plugin in this function
  }

  // this will be called when User changes input 
  function search(query, res) {
    // you can add a `SearchResult`
    res.add({
      id: 'the-identifier-of-search-result', // String (required)
      payload: {},                           // Any Plain-objects (required)
      title: '**Hello, World!**',            // String (required)
      desc: 'this is the description',       // String (required)
      redirect: 'another query',             // String (optional)
      icon: '#fa fa-heart'                   // String (optional)
    });
  }

  // this will be called when User choosed one from `SearchResult`s.
  function execute(id, payload) {
    if (id !== 'the-identifier-of-search-result')
      return;
    pluginContext.toast.enqueue('Hello, World!', 1500);
  }

  return { startup, search, execute };
};
```



#Publish

**hpm**(hain-package-manager) is using public npmjs registry as plugin repository.

so, You can publish your own plugin on npmjs(https://registry.npmjs.org/) by `npm`



You should name a plugin with prefix `hain-plugin-` like `hain-plugin-helloworld`.

then, **hpm** can find your plugins in npmjs registry.

```
npm publish
```

