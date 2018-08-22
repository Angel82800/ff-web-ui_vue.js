// BEGIN helpers
import axios from 'axios'
// END helpers

const state = {
  industries: [],
  myDataInit: false
}

const mutations = {
  setIndustries (state, {industries}) {
    state.industries = industries
  },
  initMyData (state) {
    state.myDataInit = true
  }
}

const getters = {
  apiPort (state, getters, rootState) {
    return (location.hostname === '2fers-dev.factoryfix.com' || location.hostname === 'gigs.factoryfix.com') ? '' : rootState.vars.api.ports.customers
  },
  baseUrl (state, getters, rootState) {
    return rootState.vars.api.baseUrl + getters.apiPort + '/' + rootState.vars.api.version + '/customers'
  },
  headers (state, getters, rootState) {
    return {
      headers: {
        Authorization: 'Bearer ' + rootState.auth.access_token
      }
    }
  },
  industrySelected: (state) => (industryId) => {
    return state.industries.find((industry) => {
      return industry === industryId
    })
  },
  industriesCompare: (state) => (industries) => {
    // check if the submitted array of industries is functionally the same as those already selected
    let testIndex = -1
    let testIndustries = industries.slice()
    if (state.industries.length === testIndustries.length) {
      for (var i = 0; i < state.industries.length; i++) {
        testIndex = testIndustries.findIndex((industry) => {
          return (industry.toString() === state.industries[i].toString())
        })
        if (testIndex === -1) {
          return false
        }
        testIndustries.splice(testIndex, 1)
      }
      return true
    }
    return false
  }
}

const actions = {
  replaceMyIndustries ({commit, getters}, {industries}) {
    return new Promise((resolve, reject) => {
      // check to see if existing values are different from submitted values
      if (!getters.industriesCompare(industries)) {
        axios.post(getters.baseUrl + '/me/industries', {industries}, getters.headers)
          .then((data) => {
            commit('setIndustries', {industries})
            resolve()
          })
          .catch((error) => {
            console.error(error)
            reject(error)
          })
      } else {
        resolve()
      }
    })
  },
  getMyIndustries: function ({commit, getters}) {
    return new Promise((resolve, reject) => {
      if (!state.myDataInit) {
        axios.get(getters.baseUrl + '/me/industries', getters.headers)
          .then(({ data }) => {
            commit('setIndustries', {industries: data.industries})
            resolve()
          })
          .catch((error) => {
            console.error('Error getting industries data.', error)
            reject(error)
          })
      } else {
        resolve()
      }
    })
  },
  getIndustries: function ({commit, getters}, {customerId}) {
    return new Promise((resolve, reject) => {
      if (!state.myDataInit) {
        axios.get(getters.baseUrl + '/' + customerId + '/industries', getters.headers)
          .then(({ data }) => {
            commit('setIndustries', {industries: data.industries})
            resolve()
          })
          .catch((error) => {
            console.error('Error getting industries data.', error)
            reject(error)
          })
      } else {
        resolve()
      }
    })
  },
  initMyData: function ({commit, getters, state, dispatch}) {
    return new Promise((resolve, reject) => {
      if (!state.myDataInit) {
        let promises = []

        // industries
        promises.push(dispatch('getMyIndustries'))

        Promise.all(promises)
          .then(() => {
            commit('initMyData')
            resolve()
          })
          .catch((error) => {
            console.error(error)
            reject(error)
          })
      } else {
        resolve()
      }
    })
  }
}

const namespaced = true

export default {
  namespaced,
  actions,
  getters,
  mutations,
  state
}
