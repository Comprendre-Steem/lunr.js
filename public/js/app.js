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

// ROUTER 
 
const Home = { 
  template: '#page-home',
  data: function () {
    return {
      keywords: []
    }
  }
 }; 
const Search = { template: '#page-search' }; 
const Post = { template: '#page-post' }; 
 
const router = new VueRouter({ 
  routes: [ 
    { path: '/', name: 'home', component: Home }, 
    { path: '/search', name: 'search', component: Search },
    { path: '/@:author/:permlink', name: 'post', component: Post },
    { path: '/:category/@:author/:permlink', name: 'post', component: Post }
  ]
  //, mode: 'history'
}); 

// COMPONENTS

// Component to trigger the search and display the results
let search = Vue.component('search', {
  template: '#search',
  methods: {
    postUrl(result, prefix="http://www.steemit.com/") {
      return this.authorUrl(result, prefix) + '/' + result.permlink;
    },
    authorUrl(result, prefix="http://www.steemit.com/") {
      return prefix + '@' + result.author;
    },
    coverUrl(result, height=60, width=60) {
      return 'https://steemitimages.com/' + height + 'x' + width + '/' + result.cover_image_url;
    }
  },
  mounted() {
    this.$root.searchExecute(this.$route.query.q);
  }
});

let post = Vue.component('post', {
  template: '#post',
  data() {
    return {
      author: null,
      permlink: null,
      data: null,
      metadata: null
    }
  },
  methods: {

  },
  mounted() {
    this.author = this.$route.params.author;
    this.permlink = this.$route.params.permlink;

    var body = "{\"jsonrpc\": \"2.0\", \"method\": \"get_content\", \"params\" : [\"" + this.author + "\",\"" + this.permlink + "\"], \"id\": 1}"

    this.$http.post('https://steemd.steemit.com', body).then(
      response => {

        if (response.body != null && response.body.result != null) {
          this.data = response.body.result
          if (this.data != null) {
            this.metadata = JSON.parse(this.data.json_metadata)

            var html = this.data.body
            if (this.metadata['format'].includes("markdown")) {
              var converter = new showdown.Converter()
              html = converter.makeHtml(this.data.body)
            }
            $("#post-body").html(html)
          }
        }
      }, 
      response => {
        console.log("Error while getting data from steemd", this.author, this.permlink)
      });
  }
});

// Initialize the Vue Model
var app = new Vue({
  router,
  el: '#app',
  data: {
    index: lunr_idx,
    posts: lunr_data,
    results: []
  },
  components: { search },
  methods: {
    search(keywords) {
      this.$router.push({name: 'search', query: { q: keywords }})
    },
    searchExecute(keywords) {
      console.log("Searching for " + keywords);
      hits = this.index.search(keywords);
      // Extracts referencs (IDs)
      var refs = new Array;
      for(var o in hits) {
          refs.push(hits[o].ref);
      }
      // Find corresponding posts
      this.results = this.posts.filter(entry => refs.includes(entry.ID));
    }
  }
});