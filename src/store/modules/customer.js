// BEGIN helpers
import axios from 'axios'

const translateTime = (i) => {
  if (i === 0) {
    return '12 am'
  } else if (i < 12) {
    return i + ' am'
  } else if (i === 12) {
    return '12 pm'
  } else {
    return (i - 12) + ' pm'
  }
}

const getBlankCustomer = () => {
  return {
    id: null,
    name: null,
    street1: null,
    street2: null,
    city: null,
    state: null,
    postalCode: null,
    country: null,
    latitude: null,
    longitude: null,
    locationId: null,
    photo_url: null,
    open_start: 7,
    open_end: 15,
    open_sun: null,
    open_mon: true,
    open_tue: true,
    open_wed: true,
    open_thu: true,
    open_fri: true,
    open_sat: null
  }
}
// END helpers

const state = {
  mine: getBlankCustomer(),
  myDataInitMaxAage: 45 * 1000, // 45 seconds
  myDataInitStatus: false,
  searchQuery: {},
  customers: [],
  customer: {}
}

const mutations = {
  setMine (state, {customer}) {
    state.mine = customer
  },
  initMyData (state, {status}) {
    state.myDataInitStatus = status
  },
  setSearchQuery (state, query) {
    state.searchQuery = query
  },
  setCustomers (state, customers) {
    state.customers = customers
  },
  setCustomer (state, customer) {
    state.customer = customer
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
  operationHours (state) {
    return translateTime(state.mine.open_start) + ' to ' + translateTime(state.mine.open_end)
  },
  operationDays (state, getters, rootState) {
    let availDays = []
    for (let i = 0; i < rootState.vars.days.length; i++) {
      if (state.mine['open_' + rootState.vars.days[i].toLowerCase()]) {
        availDays.push(rootState.vars.days[i])
      }
    }
    return availDays.join(', ')
  },
  dataCompare: (state) => (which, data) => {
    // check if the submitted object/array of data is functionally the same as that stored in current state
    let testIndex = -1
    let testData
    if (Array.isArray(data)) {
      testData = data.slice()
      if (state[which].length === testData.length) {
        for (let i = 0; i < state[which].length; i++) {
          testIndex = testData.findIndex((testMe) => {
            return (testMe.toString() === state[which][i].toString())
          })
          if (testIndex === -1) {
            return false
          }
          testData.splice(testIndex, 1)
        }
        return true
      }
    } else if (typeof data === 'object') {
      // Create arrays of property names
      let aProps = Object.getOwnPropertyNames(data)
      let bProps = Object.getOwnPropertyNames(state[which])

      // If number of properties is different,
      // objects are not equivalent
      if (aProps.length !== bProps.length) {
        return false
      }

      for (let i = 0; i < aProps.length; i++) {
        let propName = aProps[i]

        // If values of same property are not equal,
        // objects are not equivalent
        if (propName !== '__ob__' && data[propName] !== state[which][propName]) {
          return false
        }
      }

      // If we made it this far, objects
      // are considered equivalent
      return true
    }
    return false
  },
  customerSelectList (state) {
    let selectList = []
    for (let i = 0; i < state.customers.length; i++) {
      selectList.push({
        id: state.customers[i].id,
        display: state.customers[i].name + ' (' + state.customers[i].city + ', ' + state.customers[i].state + ')'
      })
    }
    return selectList
  }
}

const actions = {
  addMyCustomer: function ({commit, getters}, {customer}) {
    customer.locationId = (customer.locationId) ? customer.locationId : null // it can't be a simple blank
    return new Promise((resolve, reject) => {
      axios.post(getters.baseUrl + '/me', {customer}, getters.headers)
        .then(({data}) => {
          commit('setMine', {customer: data.customer})
          resolve()
        })
        .catch((error) => {
          console.log('error in addMyCustomer')
          reject(error)
        })
    })
  },
  updateMyCustomer: function ({commit, getters}, {customer}) {
    customer.locationId = (customer.locationId) ? customer.locationId : null // it can't be a simple blank
    return new Promise((resolve, reject) => {
      if (!getters.dataCompare('mine', customer)) {
        axios.patch(getters.baseUrl + '/me', {customer}, getters.headers)
          .then(({data}) => {
            commit('setMine', {customer: data.customer}) // we needd to use the returnedd data due to possible changes in locationId data
            resolve()
          })
          .catch((error) => {
            console.log('error in updateMyCustomer')
            reject(error)
          })
      } else {
        resolve()
      }
    })
  },
  getMyCustomer: function ({commit, getters, dispatch}, {override}) {
    return new Promise((resolve, reject) => {
      dispatch('checkInit')
        .then(() => {
          if (!state.myDataInitStatus || override) {
            axios.get(getters.baseUrl + '/me', getters.headers)
              .then(({data}) => {
                if (typeof data.customer !== 'undefined') {
                  commit('setMine', {customer: data.customer})
                }
                resolve()
              })
              .catch((error) => {
                console.error('customer.getMyCustomer', error)
                reject(error)
              })
          } else {
            resolve()
          }
        })
        .catch((error) => {
          reject(error)
        })
    })
  },
  search ({getters, commit, rootGetters}, {query}) {
    commit('setSearchQuery', query)
    return new Promise((resolve, reject) => {
      let getString = rootGetters.buildGetString(query)
      axios.get(`${getters.baseUrl}?${getString}`, getters.headers)
        .then(({data}) => {
          commit('setCustomers', data.customers)
          resolve()
        })
        .catch((error) => {
          console.error('Error getting customers.', error)
          reject(error)
        })
    })
  },
  getCustomer ({getters, commit}, {customerId}) {
    return new Promise((resolve, reject) => {
      console.log(getters.baseUrl + '/' + customerId)
      axios.get(getters.baseUrl + '/' + customerId, getters.headers)
        .then(({data}) => {
          if (typeof data.customer !== 'undefined') {
            commit('setCustomer', data.customer)
          }
          resolve(data)
        })
        .catch((error) => {
          console.error('customer.getCustomer', error)
          reject(error)
        })
    })
  },
  checkInit: function ({commit, getters, state}) {
    return new Promise((resolve, reject) => {
      // if there is a current init process that started but did not finish, it will be a unix timestamp. If it is too old, bounce it
      if (state.myDataInitStatus !== false && state.myDataInitStatus !== true) {
        // check age
        let ts = (new Date()).getTime()
        if (state.myDataInitStatus + state.myDataInitMaxAge < ts) {
          // timed out
          commit('initMyData', {status: false})
        }
      }
      resolve()
    })
  },
  initMyData: function ({commit, state, dispatch}) {
    return new Promise((resolve, reject) => {
      dispatch('checkInit')
        .then(() => {
          if (!state.myDataInitStatus) {
            commit('initMyData', {status: (new Date()).getTime()})
            let promises = []
            // mine
            promises.push(dispatch('getMyCustomer', {override: true}))
            Promise.all(promises)
              .then(() => {
                commit('initMyData', {status: true})
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
        .catch((error) => {
          reject(error)
        })
    })
  },
  clearMyData: function ({commit}) {
    commit('setMine', {customer: getBlankCustomer()})
    commit('initMyData', {status: false})
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
