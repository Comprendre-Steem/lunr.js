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
});