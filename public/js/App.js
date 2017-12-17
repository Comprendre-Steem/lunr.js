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

// Create global store
// https://vuejs.org/v2/guide/state-management.html
var store = {
  debug: true,
  state: { 
    results: []
  },
  setSearchResults (newValue) {
    if (this.debug) console.log('setMessageAction triggered with', newValue)
    this.state.results = newValue
  },
  clearSearchResults () {
    if (this.debug) console.log('clearMessageAction triggered')
    this.state.results = null
  }
}


// Define behavior for search results
Vue.component('search-results', {
  props: ['result'],
  template: '#result-template',
  data: {
    state: store.state
  },
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
});

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

// Initialize the Vue Model
var app = new Vue({
  router,
  el: '#app',
  data: {
    keywords: '',
    index: lunr_idx,
    posts: lunr_data,
    state: store.state
  },
  methods: {
    search: function() {
      console.log("Searching for " + this.keywords);
      hits = this.index.search(this.keywords);
      // Extracts referencs (IDs)
      var refs = new Array;
      for(var o in hits) {
          refs.push(hits[o].ref);
      }
      // Find corresponding posts
      this.store.state.results = this.posts.filter(entry => refs.includes(entry.ID));
    }
  }
});

// Always start from home
router.push({ path: '/' });