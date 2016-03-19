# Response
Response is a object which provides functions such as:

* **add(result)**  
  - `result` SearchResult  
* **add(results)**  
  - `results` Array\<SearchResult\>  

  You can add your SearchResult to ResultList in the app by calling this function
  

* **remove(id)**  
  - `id` Any - identifier of a SearchResult to be removed  

  You can remove a SearchResult that you did add using the identifier.
    
You can use it for sending(adding) or removing SearchResults.
and it is always provided as second argument of `search(query, res)` function.
>**Note:** All function calls will be ignored when user has changed input. 

**Example**  
```javascript
function search(query, res) {
  res.add({
    id: 'temp',
    title: 'Fetching...',
    desc: 'Please wait a second'
  });
  setTimeout(() => res.remove('temp'), 1000);
}
```

## Related Docs
* [SearchResult](search-result.md)
