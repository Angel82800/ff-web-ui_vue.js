/* BEGIN helpers */
import axios from 'axios'

const blankGig = (customer) => {
  return {
    description: null,
    skill_category_id: null,
    street1: customer ? customer.street1 : '',
    city: customer ? customer.city : '',
    state: customer ? customer.state : '',
    postalCode: customer ? customer.postalCode : '',
    status: 'draft',
    locationId: customer ? customer.locationId : '',
    latitude: customer ? customer.latitude : '',
    longitude: customer ? customer.longitude : '',
    customer_id: customer ? customer.id : '',
    time_start: customer ? customer.open_start : '',
    time_end: customer ? customer.open_end : '',
    req_sun: customer ? customer.open_sun : '',
    req_mon: customer ? customer.open_mon : '',
    req_tue: customer ? customer.open_tue : '',
    req_wed: customer ? customer.open_wed : '',
    req_thu: customer ? customer.open_thu : '',
    req_fri: customer ? customer.open_fri : '',
    req_sat: customer ? customer.open_sat : ''
  }
}

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
/* END helpers */

const state = {
  gig: {},
  gigSkills: [],
  gigDetails: [],
  gigs: [],
  gigsStatusCounts: [],
  gigsSelectedStatusName: null,
  gigsSortedByData: null,
  listStatus: 'all',
  myDataInitStatus: false,
  applicants: []
}

const mutations = {
  setGig: function (state, {gig}) {
    state.gig = gig
  },
  setGigs: function (state, {gigs}) {
    state.gigs = gigs
  },
  setGigsStatusCounts: function (state, {gigsStatusCounts}) {
    state.gigsStatusCounts = gigsStatusCounts
  },
  addGig: function (state, {gig}) {
    state.gigs.push(gig)
  },
  gigStatus: function (state, {status}) {
    state.gig.status = status
  },
  deleteGig: function (state, {gigId}) {
    let index = state.gigs.findIndex((testGig) => {
      return testGig.id === gigId
    })
    if (index > -1) {
      state.gigs.splice(index, 1)
    }
  },
  replaceGig: function (state, {gig}) {
    let index = state.gigs.findIndex((testGig) => {
      return testGig.id === gig.id
    })
    if (index > -1) {
      state.gigs[index] = gig
    }
  },
  setGigSkills: function (state, {skills}) {
    state.gigSkills = skills
  },
  setGigDetails: function (state, {details}) {
    state.gigDetails = details
  },
  updateGigInList: function (state, {gig}) {
    let idx = state.gigs.findIndex((testGig) => {
      return testGig.id === gig.id
    })
    if (idx > -1) {
      state.gigs.splice(idx, 1, gig)
    }
  },
  setGigsSelectedStatusName: function (state, {gigsSelectedStatusName}) {
    state.gigsSelectedStatusName = gigsSelectedStatusName
  },
  setGigsSortedByData: function (state, {gigsSortedByData}) {
    state.gigsSortedByData = gigsSortedByData
  },
  setListStatus: function (state, {newStatus}) {
    state.listStatus = newStatus
  },
  setApplicants (state, {applicants}) {
    state.applicants = applicants
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
    return rootState.vars.api.baseUrl + getters.apiPort + '/' + rootState.vars.api.version + '/customers/me/gigs'
  },
  headers (state, getters, rootState) {
    return {
      headers: {
        Authorization: 'Bearer ' + rootState.auth.access_token
      }
    }
  },
  newGig: (state) => (customer) => {
    return blankGig(customer)
  },
  skillLevel: (state) => (id) => {
    let val = state.gigSkills.find((gigSkill) => {
      return gigSkill.skill_id === id
    })
    return (typeof val !== 'undefined') ? val.level : 0
  },
  detailSelected: (state) => (id) => {
    let val
    if (state.gigDetails && state.gigDetails.length) {
      val = state.gigDetails.find((detail) => {
        return detail.skill_detail_id === id
      })
    }
    return (typeof val !== 'undefined')
  },
  requiredHours (state) {
    let hours = ''
    if (state.gig) {
      hours = translateTime(state.gig.time_start) + ' to ' + translateTime(state.gig.time_end)
    }
    return hours
  },
  requiredDays (state, getters, rootState) {
    let availDays = []
    if (state.gig) {
      for (let i = 0; i < rootState.vars.days.length; i++) {
        if (state.gig['req_' + rootState.vars.days[i].toLowerCase()]) {
          availDays.push(rootState.vars.days[i])
        }
      }
    }
    return availDays.join(', ')
  },
  gigById: (state) => (id) => {
    return state.gigs.find((testGig) => {
      return testGig.id === id
    })
  },
  gigsByStatus: (state) => {
    if (state.listStatus === 'all') {
      return state.gigs.filter((gig) => {
        return gig.status !== 'removed' && gig.status !== 'archived'
      })
    } else {
      return state.gigs.filter((gig) => {
        return gig.status === state.listStatus
      })
    }
  }
}

const actions = {
  getGigs_new: function ({getters, commit}) {
    return new Promise((resolve, reject) => {
      axios.get(getters.baseUrl, getters.headers)
        .then(({data}) => {
          commit('setGigs', {gigs: data.gigs})
          resolve(data)
        })
        .catch((error) => {
          console.error('Error getting gigs.', error)
          reject(error)
        })
    })
  },
  addGig: function ({getters, commit}, {gig}) {
    gig.locationId = (gig.locationId) ? gig.locationId : null // it can't be a simple blank
    return new Promise((resolve, reject) => {
      axios.post(getters.baseUrl, {gig}, getters.headers)
        .then(({data}) => {
          commit('setGig', {gig: data.gig})
          commit('addGig', {gig: data.gig})
          gig.id = data.gig.id
          resolve(gig)
        })
        .catch((error) => {
          console.log('error in customerGigs.addGig')
          reject(error)
        })
    })
  },
  updateGig: function ({getters, commit}, {gig}) {
    gig.locationId = (gig.locationId) ? gig.locationId : null // it can't be a simple blank
    return new Promise((resolve, reject) => {
      axios.put(getters.baseUrl + '/' + gig.id, {gig}, getters.headers)
        .then(({data}) => {
          commit('setGig', {gig: data.gig})
          commit('updateGigInList', {gig: data.gig})
          resolve(gig)
        })
        .catch((error) => {
          console.log('error in customerGigs.updateGig')
          reject(error)
        })
    })
  },
  publishGig: function ({getters, commit}, {gigId}) {
    return new Promise((resolve, reject) => {
      axios.post(getters.baseUrl + '/' + gigId + '/live', {}, getters.headers)
        .then(({data}) => {
          commit('gigStatus', {status: data.status})

          // TODO: integrate into gigs list
          resolve(data.status)
        })
        .catch((error) => {
          console.log('error in customerGigs.updateGig')
          reject(error)
        })
    })
  },
  getGig: function ({commit, getters}, {gigId}) {
    return new Promise((resolve, reject) => {
      axios.get(getters.baseUrl + '/' + gigId, getters.headers)
        .then(({ data }) => {
          commit('setGig', {gig: data.gig})
          resolve(data)
        })
        .catch((error) => {
          console.error('Error getting gig data.', error)
          reject(error)
        })
    })
  },
  removeGig: function ({commit, getters, state}, {gig}) {
    return new Promise((resolve, reject) => {
      axios.delete(getters.baseUrl + '/' + gig.id, getters.headers)
        .then(({ data }) => {
          if (data.newStatus === 'deleted') {
            commit('deleteGig', {gigId: gig.id})
          } else {
            commit('setGig', {gig})
            commit('gigStatus', {status: data.newStatus})
            commit('replaceGig', {gig: state.gig})
          }
          resolve()
        })
        .catch((error) => {
          console.error('Error deleting gig data.', error)
          reject(error)
        })
    })
  },
  getGigSkills: function ({commit, getters}, {gigId}) {
    return new Promise((resolve, reject) => {
      axios.get(getters.baseUrl + '/' + gigId + '/skills', getters.headers)
        .then(({ data }) => {
          commit('setGigSkills', {skills: data.skills})
          resolve()
        })
        .catch((error) => {
          console.error('Error getting skills data.', error)
          reject(error)
        })
    })
  },
  updateGigSkills: function ({commit, getters, state}, {gigSkills}) {
    return new Promise((resolve, reject) => {
      axios.post(getters.baseUrl + '/' + state.gig.id + '/skills', {gigSkills}, getters.headers)
        .then(() => {
          commit('setGigSkills', {skills: gigSkills})
          resolve()
        })
        .catch((error) => {
          console.error('Error updating skills data.', error)
          reject(error)
        })
    })
  },
  getGigDetails: function ({commit, getters}, {gigId}) {
    return new Promise((resolve, reject) => {
      axios.get(getters.baseUrl + '/' + gigId + '/details', getters.headers)
        .then(({ data }) => {
          commit('setGigDetails', {details: data.details})
          resolve()
        })
        .catch((error) => {
          console.error('Error getting skill details data.', error)
          reject(error)
        })
    })
  },
  replaceGigDetails: function ({commit, getters, state}, {gigDetails}) {
    return new Promise((resolve, reject) => {
      axios.post(getters.baseUrl + '/' + state.gig.id + '/details', {gigDetails}, getters.headers)
        .then(() => {
          commit('setGigDetails', {details: gigDetails})
          resolve()
        })
        .catch((error) => {
          console.error('Error updating skills data.', error)
          reject(error)
        })
    })
  },

  getGigs: function ({commit, getters, state}) {
    const statusName = state.gigsSelectedStatusName === 'all' ? null : '1'

    const [sortColumn, sortDescending] = state.gigsSortedByData
    let sortData = null
    if (sortColumn) {
      sortData = (sortDescending ? '-' : '+') + sortColumn
    }

    return axios
      .get(
        getters.baseUrl,
        Object.assign({}, getters.headers, {
          params: { name: statusName, sort: sortData }
        })
      )
      .then(({data}) => {
        commit('setGigs', {gigs: data.gigs})
      })
      .catch((error) => {
        console.error('Error getting gigs.', error)
        throw error
      })
  },

  getGigsStatusCounts: function ({commit, getters, state}) {
    return axios.get(getters.baseUrl + '/count', getters.headers)
      .then(({data}) => {
        commit('setGigsStatusCounts', {gigsStatusCounts: data.statusCounts})
      })
      .catch((error) => {
        console.error('Error getting gigs status counts.', error)
        throw error
      })
  },

  getApplicants: function ({commit, getters, state}, {gigId}) {
    return new Promise((resolve, reject) => {
      axios.get(getters.baseUrl + '/' + gigId + '/applicants', getters.headers)
        .then(({data}) => {
          commit('setApplicants', {applicants: data.applicants})
          resolve(data.applicants)
        })
        .catch((error) => {
          console.error('Error getting applicants.', error)
          reject(error)
        })
    })
  },
  clearMyData: function ({commit}, {customer}) {
    return new Promise((resolve, reject) => {
      commit('setGig', blankGig(customer))
      commit('setGigSkills', {skills: []})
      commit('setGigDetails', {details: []})
      resolve()
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
            promises.push(dispatch('getGigs', {override: true}))
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
