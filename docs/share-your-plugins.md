# Share your plugins

In short, you can share your plugin by publishing it on public npmjs registry.  
But there are few rules.

1. You should name your plugin prefixed with `hain-plugin-`, then hpm(hain-package-manager) can find your plugin in npmjs registry.
2. You should add `hain0` keyword in your package.json, then hpm can  decide api compatibility.

## Publishing
In your plugin directory:
```
npm publish
```
Done.  
You can find your plugin in few seconds then if you read rules above properly.

## Related Docs
- [package.json Format](package-json-format.md)