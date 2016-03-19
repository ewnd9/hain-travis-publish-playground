# Plugin Documentation

## Tutorials

* Hello, World
* Making Github Trending Plugin

## Guides

* Run your plugins
* [Share your plugins](share-your-plugins.md)

## API References

* [Plugin Skeleton (How to define a plugin module)](plugin-skeleton.md)
* [package.json Format](package-json-format.md)
* [PluginContext](plugin-context.md)
  - [App](plugin-context-app.md)
  - [Toast](plugin-context-toast.md)
  - [Shell](plugin-context-shell.md)
  - [Logger](plugin-context-logger.md)
* [SearchResult](search-result.md)
* [Response (res)](response.md)
* [Icon URL Format](icon-url-format.md)
* [Text Format](text-format.md)

## Very Important Notice

* You should avoid to use `console.log` in your plugin or plugin process would be break. Instead, you can use `PluginContext.Logger`. (for unknown reason)
