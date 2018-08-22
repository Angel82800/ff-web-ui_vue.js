// BEGIN helpers
import axios from 'axios'

// END helpers

const state = {
  employers: [],
  skillDetails: [],
  myDataInit: false,
  skillDetailsProcessing: []
}

const mutations = {
  setEmployers: function (state, {employers}) {
    state.employers = employers
  },
  updateEmployer: function (state, {employer}) {
    let temp = state.employers
    let index = temp.findIndex((employerTest) => {
      return employer.id === employerTest.id
    })
    if (index > -1) {
      temp[index] = employer
    } else {
      temp.push(employer)
    }
    // sort descending
    temp.sort((a, b) => {
      if (a.endYYYYMMsort > b.endYYYYMMsort || (a.endYYYYMMsort === b.endYYYYMMsort && a.startYYYYMM > b.startYYYYMM)) {
        return -1
      }
      if (a.endYYYYMMsort < b.endYYYYMMsort || (a.endYYYYMMsort === b.endYYYYMMsort && a.startYYYYMM < b.startYYYYMM)) {
        return 1
      }
      // equal dates -- sort names asc
      if (a.name > b.name) {
        return 1
      }
      return 0
    })
    state.employers = temp
  },
  deleteEmployer: function (state, {employerId}) {
    let index = state.employers.findIndex((employerTest) => {
      return employerId === employerTest.id
    })
    state.employers.splice(index, 1)
  },
  setSkillDetails: function (state, {skillDetails}) {
    state.skillDetails = skillDetails
  },
  addSkillDetail: function (state, {skillDetail}) {
    state.skillDetails.push(skillDetail)
  },
  deleteSkillDetail: function (state, {employerId, skillDetailId}) {
    let index = state.skillDetails.findIndex((skillDetail) => {
      return (skillDetail.expert_skill_detail_skill_detail_id === skillDetailId &&
                skillDetail.expert_history_employer_id === employerId)
    })
    state.skillDetails.splice(index, 1)
  },
  addSkillDetailProcessing: function (state, {skillDetailId}) {
    state.skillDetailsProcessing.push(skillDetailId)
  },
  deleteSkillDetailProcessing: function (state, {skillDetailId}) {
    let index = state.skillDetailsProcessing.indexOf(skillDetailId)
    state.skillDetailsProcessing.splice(index, 1)
  },
  initMyData (state) {
    state.myDataInit = true
  }
}

const getters = {
  apiPort (state, getters, rootState) {
    return (location.hostname === '2fers-dev.factoryfix.com' || location.hostname === 'gigs.factoryfix.com') ? '' : rootState.vars.api.ports.users
  },
  baseUrl (state, getters, rootState) {
    return rootState.vars.api.baseUrl + getters.apiPort + '/' + rootState.vars.api.version + '/users/experts'
  },
  headers (state, getters, rootState) {
    return {
      headers: {
        Authorization: 'Bearer ' + rootState.auth.access_token
      }
    }
  },
  employerSkillDetails: (state) => ({employerId}) => {
    return state.skillDetails.filter((skillDetail) => {
      return skillDetail.expert_history_employer_id === employerId
    })
  },
  employerSkillDetailProcessing: (state) => ({skillDetailId}) => {
    let index = state.skillDetailsProcessing.indexOf(skillDetailId)
    return (index > -1)
  }
}

const actions = {
  deleteMyEmployer: function ({commit, getters}, {employerId}) {
    return new Promise((resolve, reject) => {
      axios.delete(getters.baseUrl + '/me/employers/' + employerId, getters.headers)
        .then(({ data }) => {
          commit('deleteEmployer', {employerId})
          resolve()
        })
        .catch((error) => {
          console.log('error in deleteMyEmployer')
          reject(error)
        })
    })
  },
  replaceMyEmployer: function ({commit, getters}, {employer}) {
    return new Promise((resolve, reject) => {
      axios.post(getters.baseUrl + '/me/employers', {employer}, getters.headers)
        .then(({ data }) => {
          commit('updateEmployer', {employer: data.employer})
          resolve(data.employer)
        })
        .catch((error) => {
          console.log('error in replaceMyEmployer')
          reject(error)
        })
    })
  },
  getMyEmployers: function ({commit, getters}, {override}) {
    return new Promise((resolve, reject) => {
      if (!state.myDataInit || override) {
        axios.get(getters.baseUrl + '/me/employers', getters.headers)
          .then(({ data }) => {
            commit('setEmployers', {employers: data.employers})
            resolve()
          })
          .catch((error) => {
            console.error('Error getting employers data.', error)
            reject(error)
          })
      } else {
        resolve()
      }
    })
  },
  addMyEmployerSkillDetail: function ({commit, getters}, {employerId, skillDetailId}) {
    return new Promise((resolve, reject) => {
      axios.post(getters.baseUrl + '/me/employers/' + employerId + '/skillDetails', {skillDetailId}, getters.headers)
        .then(({ data }) => {
          commit('addSkillDetail', {skillDetail: {expert_history_employer_id: employerId, expert_skill_detail_skill_detail_id: skillDetailId}})
          resolve()
        })
        .catch((error) => {
          console.log('error in addMyEmployerSkillDetails')
          reject(error)
        })
    })
  },
  deleteMyEmployerSkillDetail: function ({commit, getters}, {employerId, skillDetailId}) {
    return new Promise((resolve, reject) => {
      axios.delete(getters.baseUrl + '/me/employers/' + employerId + '/skillDetails/' + skillDetailId, getters.headers)
        .then(({ data }) => {
          commit('deleteSkillDetail', {employerId, skillDetailId})
          resolve()
        })
        .catch((error) => {
          console.log('error in deleteMyEmployerSkillDetails')
          reject(error)
        })
    })
  },
  getMyEmployerSkillDetails: function ({commit, getters}, {override}) {
    return new Promise((resolve, reject) => {
      if (!state.myDataInit || override) {
        axios.get(getters.baseUrl + '/me/employers/skillDetails', getters.headers)
          .then(({ data }) => {
            commit('setSkillDetails', {skillDetails: data.skillDetails})
            resolve()
          })
          .catch((error) => {
            console.error('Error getting employer skill details data.', error)
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

        // employers
        promises.push(dispatch('getMyEmployers', {override: true}))
        // skillDetails
        promises.push(dispatch('getMyEmployerSkillDetails', {override: true}))

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
  },
  deleteEditEmployer: function ({commit, getters}, {userProfileId, employerId}) {
    return new Promise((resolve, reject) => {
      axios.delete(getters.baseUrl + '/' + userProfileId + '/employers/' + employerId, getters.headers)
        .then(({ data }) => {
          commit('deleteEmployer', {employerId})
          resolve()
        })
        .catch((error) => {
          console.log('error in deleteMyEmployer')
          reject(error)
        })
    })
  },
  replaceEditEmployer: function ({commit, getters}, {userProfileId, employer}) {
    return new Promise((resolve, reject) => {
      axios.post(getters.baseUrl + '/' + userProfileId + '/employers', {employer}, getters.headers)
        .then(({ data }) => {
          commit('updateEmployer', {employer: data.employer})
          resolve(data.employer)
        })
        .catch((error) => {
          console.log('error in replaceMyEmployer')
          reject(error)
        })
    })
  },
  getEditEmployers: function ({commit, getters}, {userProfileId}) {
    return new Promise((resolve, reject) => {
      axios.get(getters.baseUrl + '/' + userProfileId + '/employers', getters.headers)
        .then(({ data }) => {
          commit('setEmployers', {employers: data.employers})
          resolve()
        })
        .catch((error) => {
          console.error('Error getting employers data.', error)
          reject(error)
        })
    })
  },
  addEditEmployerSkillDetail: function ({commit, getters}, {userProfileId, employerId, skillDetailId}) {
    return new Promise((resolve, reject) => {
      axios.post(getters.baseUrl + '/' + userProfileId + '/employers/' + employerId + '/skillDetails', {skillDetailId}, getters.headers)
        .then(({ data }) => {
          commit('addSkillDetail', {skillDetail: {expert_history_employer_id: employerId, expert_skill_detail_skill_detail_id: skillDetailId}})
          resolve()
        })
        .catch((error) => {
          console.log('error in addMyEmployerSkillDetails')
          reject(error)
        })
    })
  },
  deleteEditEmployerSkillDetail: function ({commit, getters}, {userProfileId, employerId, skillDetailId}) {
    return new Promise((resolve, reject) => {
      axios.delete(getters.baseUrl + '/' + userProfileId + '/employers/' + employerId + '/skillDetails/' + skillDetailId, getters.headers)
        .then(({ data }) => {
          commit('deleteSkillDetail', {employerId, skillDetailId})
          resolve()
        })
        .catch((error) => {
          console.log('error in deleteMyEmployerSkillDetails')
          reject(error)
        })
    })
  },
  getEditEmployerSkillDetails: function ({commit, getters}, {userProfileId}) {
    return new Promise((resolve, reject) => {
      axios.get(getters.baseUrl + '/' + userProfileId + '/employers/skillDetails', getters.headers)
        .then(({ data }) => {
          commit('setSkillDetails', {skillDetails: data.skillDetails})
          resolve()
        })
        .catch((error) => {
          console.error('Error getting employer skill details data.', error)
          reject(error)
        })
    })
  },
  initEditData: function ({commit, getters, dispatch}, {userProfileId}) {
    return new Promise((resolve, reject) => {
      let promises = []

      // employers
      promises.push(dispatch('getEditEmployers', {userProfileId}))
      // skillDetails
      promises.push(dispatch('getEditEmployerSkillDetails', {userProfileId}))

      Promise.all(promises)
        .then(() => {
          resolve()
        })
        .catch((error) => {
          console.error(error)
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
