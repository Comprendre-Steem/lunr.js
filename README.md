This Projet show how to build a search engine for Steem posts in order to include it in your website:

## Fetch data from SteemSQL

The goal is to build a JSON file containing all the posts you want to index.

Here is an example of the format for one entry:

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

## Use a pre-build search index

### Install lunr.js

> npm install lunr

### Build the index

This is an example taken [from the lunr.js documentation](https://lunrjs.com/guides/index_prebuilding.html).
I just adapted the field to index (ID, title, tags and author).

```
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

