// BEGIN helpers
import axios from 'axios'
// END helpers

const state = {
  categories: [],
  skills: [],
  details: [],
  myDataInitMaxAage: 45 * 1000, // 45 seconds
  myDataInitStatus: false
}

const mutations = {
  setCategories (state, {categories}) {
    state.categories = categories
  },
  setSkills (state, {skills}) {
    state.skills = skills
  },
  setDetails (state, {details}) {
    state.details = details
  },
  initMyData (state, {status}) {
    state.myDataInitStatus = status
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
  isSelected: (state) => (which, id) => {
    let val = state[which].find((testId) => {
      if (which === 'skills') {
        return testId.skill_id === id
      } else if (which === 'details') {
        return testId.skill_detail_id === id
      } else {
        return testId === id
      }
    })
    return (typeof val !== 'undefined')
  },
  dataCompare: (state) => (which, data) => {
    // check if the submitted array of data is functionally the same as those already selected
    let testIndex = -1
    let testData = data.slice()
    if (state[which].length === testData.length) {
      for (var i = 0; i < state[which].length; i++) {
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
    return false
  }
}

const actions = {
  replaceMyCategories ({commit, getters}, {categories}) {
    return new Promise((resolve, reject) => {
      // check to see if existing values are different from submitted values
      if (!getters.dataCompare('categories', categories)) {
        axios.post(getters.baseUrl + '/me/skillCategories', {categories}, getters.headers)
          .then((data) => {
            commit('setCategories', {categories})
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
  getMyCategories: function ({commit, getters, dispatch}, {override}) {
    return new Promise((resolve, reject) => {
      dispatch('checkInit')
        .then(() => {
          if (!state.myDataInitStatus || override) {
            axios.get(getters.baseUrl + '/me/skillCategories', getters.headers)
              .then(({ data }) => {
                commit('setCategories', {categories: data.categories})
                resolve()
              })
              .catch((error) => {
                console.error('Error getting categories data.', error)
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
  replaceMySkills ({commit, getters}, {skills}) {
    return new Promise((resolve, reject) => {
      // check to see if existing values are different from submitted values
      if (!getters.dataCompare('skills', skills)) {
        axios.post(getters.baseUrl + '/me/skills', {skills}, getters.headers)
          .then((data) => {
            commit('setSkills', {skills})
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
  getMySkills: function ({commit, getters, dispatch}, {override}) {
    return new Promise((resolve, reject) => {
      dispatch('checkInit')
        .then(() => {
          if (!state.myDataInitStatus || override) {
            axios.get(getters.baseUrl + '/me/skills', getters.headers)
              .then(({ data }) => {
                commit('setSkills', {skills: data.skills})
                resolve()
              })
              .catch((error) => {
                console.error('Error getting skills data.', error)
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
  replaceMyDetails ({commit, getters}, {details}) {
    return new Promise((resolve, reject) => {
      // check to see if existing values are different from submitted values
      if (!getters.dataCompare('details', details)) {
        axios.post(getters.baseUrl + '/me/skillDetails', {details}, getters.headers)
          .then((data) => {
            commit('setDetails', {details})
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
  getMyDetails: function ({commit, getters, dispatch}, {override}) {
    return new Promise((resolve, reject) => {
      dispatch('checkInit')
        .then(() => {
          if (!state.myDataInitStatus || override) {
            axios.get(getters.baseUrl + '/me/skillDetails', getters.headers)
              .then(({ data }) => {
                commit('setDetails', {details: data.details})
                resolve()
              })
              .catch((error) => {
                console.error('Error getting skill details data.', error)
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
  initMyData: function ({commit, getters, state, dispatch}) {
    return new Promise((resolve, reject) => {
      dispatch('checkInit')
        .then(() => {
          if (!state.myDataInitStatus) {
            commit('initMyData', {status: (new Date()).getTime()})
            let promises = []

            // categories
            promises.push(dispatch('getMyCategories', {override: true}))

            // skills
            promises.push(dispatch('getMySkills', {override: true}))

            // details
            promises.push(dispatch('getMyDetails', {override: true}))

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
