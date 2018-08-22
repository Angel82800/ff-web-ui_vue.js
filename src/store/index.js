import Vue from 'vue'
import Vuex from 'vuex'
import VuexPersistence from 'vuex-persist'
import { analyticsMiddleware } from 'vue-analytics'
import createLogger from '../plugins/logger'
import '../plugins/filters'

import auth from './modules/auth'
import userProfile from './modules/userProfile'
import customer from './modules/customer'
import customerIndustries from './modules/customerIndustries'
import customerSkills from './modules/customerSkills'
import customerGigs from './modules/customerGigs'
import expert from './modules/expert'
import expertSkills from './modules/expertSkills'
import expertIndustries from './modules/expertIndustries'
import expertHistory from './modules/expertHistory'
import adminGigs from './modules/adminGigs'
import ui from './modules/ui'
import vars from './modules/vars'
import alerts from './modules/alerts'

Vue.use(Vuex)

const debug = process.env.NODE_ENV !== 'production'

// TODO: only use persistence for stuff that is mutable so we don't end up with a bunch of cruft.
const vuexLocal = new VuexPersistence({
  strictMode: true,
  storage: window.localStorage,
  reducer: state => ({auth: state.auth})
})

let plugins = []
if (debug) {
  plugins.push(createLogger())
}
plugins.push(vuexLocal.plugin)
let mutations = {
  RESTORE_MUTATION: vuexLocal.RESTORE_MUTATION
}
plugins.push(analyticsMiddleware)

let getters = {
  buildGetString: (state) => (query) => {
    console.log(query)
    let keyVals = []
    if (typeof query === 'object' && !Array.isArray(query)) {
      // strip any garbage from object
      query = JSON.parse(JSON.stringify(query))
      Object.keys(query).forEach((key) => {
        if (Array.isArray(query[key])) {
          for (let i = 0; i < query[key].length; i++) {
            keyVals.push(`${encodeURI(key)}[]=${encodeURI(query[key][i])}`)
          }
        } else {
          keyVals.push(`${encodeURI(key)}=${encodeURI(query[key])}`)
        }
      })
      return keyVals.join('&')
    } else {
      let error = {
        message: 'query is not an object',
        name: 'buildGetString error'
      }
      throw error
    }
  }
}

const store = new Vuex.Store({
  modules: {
    auth,
    userProfile,
    customer,
    customerIndustries,
    customerSkills,
    customerGigs,
    expert,
    expertSkills,
    expertIndustries,
    expertHistory,
    adminGigs,
    ui,
    vars,
    alerts
  },
  strict: debug,
  mutations,
  getters,
  plugins
})

if (module.hot) {
  // accept actions and mutations as hot modules
  let hotModules = [
    './modules/vars',
    './modules/auth',
    './modules/userProfile',
    './modules/customer',
    './modules/customerIndustries',
    './modules/customerSkills',
    './modules/customerGigs',
    './modules/expert',
    './modules/expertSkills',
    './modules/expertIndustries',
    './modules/expertHistory',
    './modules/adminGigs',
    './modules/ui',
    './modules/alerts'
  ]

  module.hot.accept(hotModules, () => {
    // require the updated modules
    // have to add .default here due to babel 6 module output
    const newVars = require('./modules/vars').default
    const newAuth = require('./modules/auth').default
    const newUserProfile = require('./modules/userProfile').default
    const newCustomer = require('./modules/customer').default
    const newCustomerIndustries = require('./modules/customerIndustries').default
    const newCustomerSkills = require('./modules/customerSkills').default
    const newCustomerGigs = require('./modules/customerGigs').default
    const newExpert = require('./modules/expert').default
    const newExpertSkills = require('./modules/expertSkills').default
    const newExpertIndustries = require('./modules/expertIndustries').default
    const newExpertHistory = require('./modules/expertHistory').default
    const adminGigs = require('./modules/adminGigs').default
    const newUi = require('./modules/ui').default
    const newAlerts = require('./modules/alerts').default
    // swap in the new actions and mutations
    store.hotUpdate({
      modules: {
        vars: newVars,
        userProfile: newUserProfile,
        customer: newCustomer,
        customerIndustries: newCustomerIndustries,
        customerSkills: newCustomerSkills,
        customerGigs: newCustomerGigs,
        expert: newExpert,
        expertSkills: newExpertSkills,
        expertIndustries: newExpertIndustries,
        expertHistory: newExpertHistory,
        auth: newAuth,
        adminGigs: adminGigs,
        ui: newUi,
        alerts: newAlerts
      }
    })
  })
}

export default store
