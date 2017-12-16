This Projet show how to build a search engine for Steem posts in order to include it in your website:

## Fetch data from SteemSQL

The goal is to build a JSON file containing all the posts you want to index.

Here is an example of the format for one entry:

```posts.json
[
	{
	    "ID": "20583237",
	    "author": "roxane",
	    "tags": "[\"fr\", \"busy\", \"minnow\", \"welcome\", \"fr-presentation\"]",
	    "title": "Pr\u00e9sentation des nouveaux francophones [depuis le 01\/12\/2017]",
	    "created": "2017-12-15 16:02:39",
	    "permlink": "presentation-des-nouveaux-francophones-depuis-le-01-12-2017",
	    "children": "16",
	    "net_votes": "69",
	    "total_payout_value": "0",
	    "cover_image_url": "https:\/\/res.cloudinary.com\/hpiynhbhq\/image\/upload\/v1513354080\/ld7vcvl3uau9va5hg2kv.jpg"
	},
	{ 
		[...] 
	}
]
```

## Use a pre-build search index

### Install lunr.js

> npm install lunr

### Build the index

This is an example taken [from the lunr.js documentation](https://lunrjs.com/guides/index_prebuilding.html).
I just adapted the field to index (ID, title, tags and author).

```App.js
var lunr = require('lunr'),
    stdin = process.stdin,
    stdout = process.stdout,
    buffer = []

stdin.resume()
stdin.setEncoding('utf8')

stdin.on('data', function (data) {
  buffer.push(data)
})

stdin.on('end', function () {
  var documents = JSON.parse(buffer.join(''))

  var idx = lunr(function () {
    this.ref('ID')
    this.field('title')
    this.field('tags')
    this.field('author')

    documents.forEach(function (doc) {
      this.add(doc)
    }, this)
  })

  stdout.write(JSON.stringify(idx))
})
```

The index can then be generated with the following command:

> cat data.json | node build-index.js > index.json


## Using the index

To use the index, two files must be loaded locally: The pre-built index and the original data.
We do this by fetching the data during `onLoad` :

```App.js
// Load pre-built index and initialize lunr.js
var lunr_idx = (function() {
    var idx = null;
    $.ajax({
        'async': false,
        'global': false,
        'url': "./index.json",
        'dataType': "json",
        'success': function (data) {
            idx = lunr.Index.load(data);
            console.log("Index loaded !");
        }
    });
    return idx;
})();

// Load posts data
var lunr_data = (function() {
    var posts = null;
    $.ajax({
        'async': false,
        'global': false,
        'url': "./posts-fr.json",
        'dataType': "json",
        'success': function (data) {
            posts = data;
            console.log("Data loaded !");
        }
    });
    return posts;
})();
```

Those data are then passed to the Vue.

The `search` function take the model's keywards (comming from an `input`) and performs the search.
The matching entries are returned in `hits`, which is then used to filter the `posts` and set the `result` variable.

```App.js
// Initialize the Vue Model
var vm = new Vue({
  el: '#vm',
  data: {
    keywords: '',
    index: lunr_idx,
    posts: lunr_data,
    results: []
  },
  methods: {
    search: function() {
      if (this.keywords != '') {
        console.log("Searching for " + this.keywords);
        hits = this.index.search(this.keywords);
        // Extracts referencs (IDs)
        var refs = new Array;
        for(var o in hits) {
            refs.push(hits[o].ref);
        }
        // Find corresponding posts
        this.results = this.posts.filter(entry => refs.includes(entry.ID));
      }
    }
  }
  ```

## Displaying the results

A VueJS component is used to display the results. 

```index.html
<search-results
	v-for="item in results"
	v-bind:result="item"
	v-bind:key="item.ID">
</search-results>
```

Once `results` is set with some daa, VueJS starts working: for each entry the defined template is applied:

```App.js
// Define behavior for search results
Vue.component('search-results', {
  props: ['result'],
  template: '<li>{{ result.ID }} - <img :src="coverUrl"/> <a :href="postUrl">{{ result.title }}</a> by <a :href="authorUrl">@{{ result.author }}</a></li>',
  computed: {
    postUrl: function() {
      return this.authorUrl + '/' + this.result.permlink;
    },
    authorUrl: function() {
      return 'http://www.steemit.com/' + '@' + this.result.author;
    },
    coverUrl: function() {
      return 'https://steemitimages.com/60x60/' + this.result.cover_image_url;
    }
  }
})
```

# Live Demo

A live demo is available on [http://search.comprendre-steem.surge.sh](http://search.comprendre-steem.surge.sh)