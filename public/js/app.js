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
 
const Home = { template: '#page-home' }; 
const Search = { template: '#page-search' }; 
 
const routes = [ 
  { path: '/', name: 'home', component: Home }, 
  { path: '/search', name: 'search', component: Search } 
]; 
 
const router = new VueRouter({ 
  routes 
}); 

let searching = Vue.component('searching', {
  template: '<div id="searching"><slot></slot></div>',
  mounted() {
    console.log("searching...");
    this.$root.$data.keywords = this.$route.query.q;
    this.$root.search();
  }
});

// Define behavior for search results

let searchResult = Vue.component('search-result', {
  props: ['result'],
  template: '#result-template',
  computed: {
    postUrl() {
      return this.authorUrl + '/' + this.result.permlink;
    },
    authorUrl() {
      return 'http://www.steemit.com/' + '@' + this.result.author;
    },
    coverUrl() {
      return 'https://steemitimages.com/60x60/' + this.result.cover_image_url;
    }
  }
})

// Initialize the Vue Model
var app = new Vue({
  router,
  el: '#app',
  data: {
    keywords: '',
    index: lunr_idx,
    posts: lunr_data,
    results: []
  },
  components: { searching, searchResult },
  methods: {
    search() {
      console.log("Searching for " + this.keywords);
      hits = this.index.search(this.keywords);
      // Extracts referencs (IDs)
      var refs = new Array;
      for(var o in hits) {
          refs.push(hits[o].ref);
      }
      // Find corresponding posts
      this.results = this.posts.filter(entry => refs.includes(entry.ID));
      this.$router.push({name: 'search', query: { q: this.keywords }})
    }
  }
});