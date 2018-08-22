// BEGIN helpers
import axios from 'axios'

const buildGetString = (query) => {
  // TODO: add to a store helper mixin
  let keyVals = []
  if (typeof query === 'object' && !Array.isArray(query)) {
    // strip any garbage from object
    query = JSON.parse(JSON.stringify(query))
    Object.keys(query).forEach((key) => {
      keyVals.push(`${encodeURI(key)}=${encodeURI(query[key])}`)
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

const getBlankSearchQuery = () => {
  return {
    status: 'draft,review,live,expired,filled,complete',
    skill_category_id: 0
  }
}

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

// END helpers

const state = {
  gig: {},
  gigs: [],
  searchQuery: getBlankSearchQuery(),
  gigSkills: [],
  gigDetails: [],
  applicants: []
}

const mutations = {
  setGig: function (state, {gig}) {
    state.gig = gig
  },
  setGigs: function (state, {gigs}) {
    state.gigs = gigs
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
  updateGigInList: function (state, {gig}) {
    let idx = state.gigs.findIndex((testGig) => {
      return testGig.id === gig.id
    })
    if (idx > -1) {
      state.gigs.splice(idx, 1, gig)
    }
  },
  setSearchQuery (state, searchQuery) {
    let blankQuery = getBlankSearchQuery()
    Object.keys(blankQuery).forEach((key) => {
      if (searchQuery.hasOwnProperty(key)) {
        state.searchQuery[key] = searchQuery[key]
      }
    })
  },
  setGigSkills: function (state, {skills}) {
    state.gigSkills = skills
  },
  setGigDetails: function (state, {details}) {
    state.gigDetails = details
  },
  setApplicants: function (state, {applicants}) {
    state.applicants = applicants
  },
  addApplicant: function (state, {applicant}) {
    state.applicants.push(applicant)
  },
  updateApplicant: function (state, {applicant}) {
    let idx = state.applicants.findIndex((testApplicant) => {
      return testApplicant.id === applicant.id
    })
    if (idx > -1) {
      state.applicants.splice(idx, 1, applicant)
    }
  }
}

const getters = {
  apiPort (state, getters, rootState) {
    return (location.hostname === '2fers-dev.factoryfix.com' || location.hostname === 'gigs.factoryfix.com') ? '' : rootState.vars.api.ports.customers
  },
  baseUrl (state, getters, rootState) {
    return rootState.vars.api.baseUrl + getters.apiPort + '/' + rootState.vars.api.version + '/customers/gigs'
  },
  headers (state, getters, rootState) {
    return {
      headers: {
        Authorization: 'Bearer ' + rootState.auth.access_token
      }
    }
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
  editable (state) {
    let editableStatus = ['draft', 'review', 'live']
    return (editableStatus.indexOf(state.gig.status) > -1)
  },
  gigById: (state) => (id) => {
    return state.gigs.find((testGig) => {
      return testGig.id === id
    })
  }
}

const actions = {
  getGigs: function ({commit, getters, state}, {query}) {
    commit('setGigs', {gigs: []})
    commit('setSearchQuery', query)
    return new Promise((resolve, reject) => {
      axios.get(`${getters.baseUrl}?${buildGetString(query)}`, getters.headers)
        .then(({data}) => {
          commit('setGigs', {gigs: data.gigs})
          resolve()
        })
        .catch((error) => {
          console.error('Error getting gigs.', error)
          reject(error)
        })
    })
  },
  getGig: function ({commit, getters, state}, {gigId}) {
    return new Promise((resolve, reject) => {
      axios.get(getters.baseUrl + '/' + gigId, getters.headers)
        .then(({ data }) => {
          commit('setGig', {gig: data.gig})
          resolve()
        })
        .catch((error) => {
          console.error('Error getting gig data.', error)
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
  updateGig: function ({getters, commit, dispatch}, {gig}) {
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
  checkGig: function ({dispatch, state}) {
    // if there are any applicants with the hire status, the gig should be filled. If not, it should not be filled. How bout them apples?
    let idx = state.applicants.findIndex((applicant) => {
      return applicant.status === 'Hired'
    })
    let gig = Object.assign({}, state.gig)
    let newStatus = false
    if (idx > -1 && state.gig.status !== 'filled') {
      newStatus = 'filled'
    } else if (state.gig.status === 'filled') {
      newStatus = 'live'
    }
    if (newStatus) {
      gig.status = newStatus
      dispatch('updateGig', {gig})
    }
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
      axios.post(getters.baseUrl + '/' + state.gig.id + '/skills', {gigSkills, gig: state.gig}, getters.headers)
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
      axios.post(getters.baseUrl + '/' + state.gig.id + '/details', {gigDetails, gig: state.gig}, getters.headers)
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
  clearMyData: function ({commit}, {customer}) {
    return new Promise((resolve, reject) => {
      commit('setGig', blankGig(customer))
      commit('setGigSkills', {skills: []})
      commit('setGigDetails', {details: []})
      commit('setApplicants', {applicants: []})
      resolve()
    })
  },
  getApplicants: function ({commit, getters, state}, {gigId}) {
    commit('setApplicants', {applicants: []})
    return new Promise((resolve, reject) => {
      axios.get(getters.baseUrl + '/' + gigId + '/applicants', getters.headers)
        .then(({ data }) => {
          commit('setApplicants', {applicants: data.applicants})
          resolve()
        })
        .catch((error) => {
          console.error('Error getting applicants data.', error)
          reject(error)
        })
    })
  },
  postApplicant: function ({commit, getters}, {applicant}) {
    console.log(applicant)
    return new Promise((resolve, reject) => {
      axios.post(getters.baseUrl + '/' + applicant.gig_id + '/applicants', {applicant}, getters.headers)
        .then(({ data }) => {
          applicant.id = data.id
          commit('addApplicant', {applicant})
          resolve()
        })
        .catch((error) => {
          console.error('Error adding applicant.', error)
          reject(error)
        })
    })
  },
  putApplicant: function ({commit, getters, state, dispatch}, {applicant}) {
    console.log(applicant)
    return new Promise((resolve, reject) => {
      axios.put(getters.baseUrl + '/' + applicant.gig_id + '/applicants/' + applicant.id, {applicant}, getters.headers)
        .then(({ data }) => {
          commit('updateApplicant', {applicant})
          dispatch('checkGig')
          resolve()
        })
        .catch((error) => {
          console.error('Error adding applicant.', error)
          reject(error)
        })
    })
  }
}

const namespaced = true

export default {
  namespaced,
  state,
  actions,
  getters,
  mutations
}
