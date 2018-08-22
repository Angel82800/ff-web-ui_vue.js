// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import Croppa from 'vue-croppa'
import Vuetify from 'vuetify'
import App from './App'
import router from './router'
import store from './store'
import VueAnalytics from 'vue-analytics'
import VueIntercom from 'vue-intercom'

// import LocalStor from './plugins/local-stor'
import 'vuetify/dist/vuetify.min.css'
// import './stylus/main.styl'
import 'vue-croppa/dist/vue-croppa.css'

import 'babel-polyfill'
import VuetifyGoogleAutocomplete from 'vuetify-google-autocomplete'

if (location.hostname !== 'placeholderWhileTesting') { // 'gigs.factoryfix.com') {
  Vue.config.devtools = true
}

// Intercom base settings. UI is launched in App.vue and updated in vuex userProfile
let intercomId = location.hostname === 'gigs.factoryfix.com' ? 'ialrux0q' : 'qd02d0ye'
Vue.use(VueIntercom, {
  appId: intercomId
})

Vue.use(VueAnalytics, {
  id: 'UA-112244617-2',
  autoTracking: {
    exception: true
  },
  router,
  ignoreRoutes: ['auth0-callback', 'super', 'super-gig', 'super-expert', 'super-company'],
  debug: {
    enabled: (location.hostname !== 'gigs.factoryfix.com'),
    sendHitTask: (location.hostname === 'gigs.factoryfix.com')
  }
})

Vue.use(Vuetify, {
  theme: {
    primary: '#00af10'
  }
})
Vue.use(Croppa)
// Vue.use(LocalStor)
Vue.use(VuetifyGoogleAutocomplete, {
  apiKey: location.hostname === 'gigs.factoryfix.com' ? 'AIzaSyAU6-T9nF9JsT2tg0bFo4RJ8-kx0IVV0io' : 'AIzaSyDtbO9wwmp6XhfAed0zg5UM3o7C3tfbnVQ'
})

Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  components: { App },
  template: '<App/>'
})
