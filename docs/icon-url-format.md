# Icon URL Format

There are three types of url formats can be used:
* Local Path
  - Relative path - relative local path to package.json. e.g. './icon.png'
  - Absolute path - absolute local path. e.g. 'C:\\Documents\\icon.png'
* Remote Path - General HTTP URL. e.g. 'https://github.com/icon.png'
* Font Awesome Classname. e.g. '#fa fa-google' / See available classes at <http://fontawesome.io/icons/>

**Example**
```javascript
function search(query, res) {
  res.add({
    title: ...,
    desc: ...,
    icon: '#fa fa-youtube'
  });
}
```