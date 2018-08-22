// BEGIN helpers
import axios from 'axios'
// END helpers

const state = {
  categories: [],
  skills: [],
  // detailGroups: [],
  details: [],
  myDataInit: false,
  detailsProcessing: []
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
  addDetails: function (state, {detail}) {
    state.details.push(detail)
  },
  deleteDetails: function (state, {detailId}) {
    let index = state.details.findIndex((detail) => {
      return (detail.skill_detail_id === detailId)
    })
    state.details.splice(index, 1)
  },
  addDetailsProcessing: function (state, {detailId}) {
    state.detailsProcessing.push(detailId)
  },
  deleteDetailsProcessing: function (state, {detailId}) {
    let index = state.detailsProcessing.indexOf(detailId)
    state.detailsProcessing.splice(index, 1)
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
  categorySelected: (state) => (catId) => {
    return (state.categories.indexOf(catId) !== -1)
  },
  categoriesCompare: (state) => (categories) => {
    // check if the submitted array of categories is functionally the same as those already selected
    if (state.categories.length === categories.length) {
      for (var i = 0; i < categories.length; i++) {
        if (!(categories.indexOf(state.categories[i]) > -1 && state.categories.indexOf(categories[i]) > -1)) {
          return false
        }
      }
      return true
    }
    return false
  },
  skillLevel: (state) => (skillId) => {
    // return matching skill level or 0
    let skill = state.skills.find((skill) => {
      return skill.skill_id === skillId
    })
    return (skill ? skill.level : 0)
  },
  skillsCompare: (state) => (skills) => {
    // check if the submitted array of skills is functionally the same as those already selected
    let testIndex = -1
    let testSkills = skills.slice()
    if (state.skills.length === testSkills.length) {
      for (var i = 0; i < state.skills.length; i++) {
        testIndex = testSkills.findIndex((skill) => {
          return (skill.skill_id.toString() === state.skills[i].skill_id.toString() && skill.level.toString() === state.skills[i].level.toString())
        })
        if (testIndex === -1) {
          return false
        }
        testSkills.splice(testIndex, 1)
      }
      return true
    }
    return false
  },
  detailLevel: (state) => (detailId) => {
    // return matching detail skill level or 0
    let detail = state.details.find((detail) => {
      return detail.skill_detail_id === detailId
    })
    return (detail ? detail.level : 0)
  },
  detailsCompare: (state) => (details) => {
    // check if the submitted array of details is functionally the same as those already selected
    let testIndex = -1
    let testDetails = details.slice()
    if (state.details.length === testDetails.length) {
      for (var i = 0; i < state.details.length; i++) {
        testIndex = testDetails.findIndex((detail) => {
          return (detail.skill_detail_id.toString() === state.details[i].skill_detail_id.toString() && detail.level.toString() === state.details[i].level.toString())
        })
        if (testIndex === -1) {
          return false
        }
        testDetails.splice(testIndex, 1)
      }
      return true
    }
    return false
  },
  unusedDetails: (state) => (usedSkillDetails) => {
    let unused = state.details.filter((detail) => {
      let index = usedSkillDetails.findIndex((usedSkillDetail) => {
        // TODO: this is comparing the wrong thing. expert_skill_detail_id is the AI of
        return usedSkillDetail.expert_skill_detail_skill_detail_id === detail.skill_detail_id
      })
      return (index === -1)
    })
    return unused
  },
  detailsById: (state) => ({detailId}) => {
    let index = state.details.findIndex((detail) => {
      return detail.skill_detail_id === detailId
    })
    return (index > -1)
  },
  detailsProcessing: (state) => ({detailId}) => {
    let index = state.detailsProcessing.indexOf(detailId)
    return (index > -1)
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
      if (!getters.categoriesCompare(categories)) {
        axios.post(getters.baseUrl + '/me/skillCategories', {categories}, getters.headers)
          .then((data) => {
            commit('setCategories', {categories})
            resolve(true)
          })
          .catch((error) => {
            console.error(error)
            reject(error)
          })
      } else {
        resolve(false)
      }
    })
  },
  replaceMySkills ({commit, getters}, {skills}) {
    return new Promise((resolve, reject) => {
      // check to see if existing values are different from submitted values
      if (!getters.skillsCompare(skills)) {
        axios.post(getters.baseUrl + '/me/skills', {skills}, getters.headers)
          .then((data) => {
            commit('setSkills', {skills})
            resolve(true)
          })
          .catch((error) => {
            console.error(error)
            reject(error)
          })
      } else {
        resolve(false)
      }
    })
  },
  replaceMyDetails ({commit, getters}, {details}) {
    return new Promise((resolve, reject) => {
      // check to see if existing values are different from submitted values
      // TODO: fix this hack?
      let newDetails = []
      for (let i = 0; i < details.length; i++) {
        newDetails.push({skill_detail_id: details[i]})
      }
      if (!getters.dataCompare('details', newDetails)) {
        axios.post(getters.baseUrl + '/me/skillDetails', {details}, getters.headers)
          .then((data) => {
            commit('setDetails', {details: newDetails})
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
  // addMyDetails: function ({commit, getters}, {detailId}) {
  //   return new Promise((resolve, reject) => {
  //     axios.post(getters.baseUrl + '/me/skillDetails', {detailId}, getters.headers)
  //       .then(({ data }) => {
  //         commit('addDetails', {detail: {skill_detail_id: detailId}})
  //         resolve()
  //       })
  //       .catch((error) => {
  //         console.log('error in addMyDetails')
  //         reject(error)
  //       })
  //   })
  // },
  // deleteMyDetails: function ({commit, getters}, {detailId}) {
  //   return new Promise((resolve, reject) => {
  //     axios.delete(getters.baseUrl + '/me/skillDetails/' + detailId, getters.headers)
  //       .then(({ data }) => {
  //         commit('deleteDetails', {detailId})
  //         resolve()
  //       })
  //       .catch((error) => {
  //         console.log('error in deleteMyDetails')
  //         reject(error)
  //       })
  //   })
  // },
  getMySkillCategories: function ({commit, getters}, {override}) {
    return new Promise((resolve, reject) => {
      if (override || !state.myDataInit) {
        axios.get(getters.baseUrl + '/me/skillCategories', getters.headers)
          .then(({ data }) => {
            commit('setCategories', {categories: data.categories})
            resolve()
          })
          .catch((error) => {
            console.error('Error getting category data.', error)
            reject(error)
          })
      } else {
        resolve()
      }
    })
  },
  getMySkills: function ({commit, getters}, {override}) {
    return new Promise((resolve, reject) => {
      if (override || !state.myDataInit) {
        axios.get(getters.baseUrl + '/me/skills', getters.headers)
          .then(({ data }) => {
            commit('setSkills', {skills: data.skills})
            resolve()
          })
          .catch((error) => {
            console.error('Error getting skill data.', error)
            reject(error)
          })
      } else {
        resolve()
      }
    })
  },
  getMySkillDetails: function ({commit, getters}, {override}) {
    return new Promise((resolve, reject) => {
      if (override || !state.myDataInit) {
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
  },
  initMyData: function ({commit, getters, state, dispatch}) {
    return new Promise((resolve, reject) => {
      if (!state.myDataInit) {
        let promises = []

        // skillCategories
        promises.push(dispatch('getMySkillCategories', {override: true}))

        // skills
        promises.push(dispatch('getMySkills', {override: true}))

        // skillDetails
        promises.push(dispatch('getMySkillDetails', {override: true}))

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
  replaceEditSkillCategories ({commit, getters}, {userProfileId, categories}) {
    return new Promise((resolve, reject) => {
      // check to see if existing values are different from submitted values
      if (!getters.categoriesCompare(categories)) {
        axios.post(getters.baseUrl + '/' + userProfileId + '/skillCategories', {categories}, getters.headers)
          .then((data) => {
            commit('setCategories', {categories})
            resolve(true)
          })
          .catch((error) => {
            console.error(error)
            reject(error)
          })
      } else {
        resolve(false)
      }
    })
  },
  replaceEditSkills ({commit, getters}, {userProfileId, skills}) {
    return new Promise((resolve, reject) => {
      // check to see if existing values are different from submitted values
      if (!getters.skillsCompare(skills)) {
        axios.post(getters.baseUrl + '/' + userProfileId + '/skills', {skills}, getters.headers)
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
  replaceEditDetails ({commit, getters}, {userProfileId, details}) {
    return new Promise((resolve, reject) => {
      // check to see if existing values are different from submitted values
      // TODO: fix this hack?
      let newDetails = []
      for (let i = 0; i < details.length; i++) {
        newDetails.push({skill_detail_id: details[i]})
      }
      if (!getters.dataCompare('details', newDetails)) {
        axios.post(getters.baseUrl + '/' + userProfileId + '/skillDetails', {details}, getters.headers)
          .then((data) => {
            commit('setDetails', {details: newDetails})
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
  getEditSkillCategories: function ({commit, getters}, {userProfileId}) {
    return new Promise((resolve, reject) => {
      axios.get(getters.baseUrl + '/' + userProfileId + '/skillCategories', getters.headers)
        .then(({ data }) => {
          commit('setCategories', {categories: data.categories})
          resolve()
        })
        .catch((error) => {
          console.error('Error getting category data.', error)
          reject(error)
        })
    })
  },
  getEditSkills: function ({commit, getters}, {userProfileId}) {
    return new Promise((resolve, reject) => {
      axios.get(getters.baseUrl + '/' + userProfileId + '/skills', getters.headers)
        .then(({ data }) => {
          commit('setSkills', {skills: data.skills})
          resolve()
        })
        .catch((error) => {
          console.error('Error getting category data.', error)
          reject(error)
        })
    })
  },
  getEditSkillDetails: function ({commit, getters}, {userProfileId}) {
    return new Promise((resolve, reject) => {
      axios.get(getters.baseUrl + '/' + userProfileId + '/skillDetails', getters.headers)
        .then(({ data }) => {
          commit('setDetails', {details: data.details})
          resolve()
        })
        .catch((error) => {
          console.error('Error getting skill details data.', error)
          reject(error)
        })
    })
  },
  initEditData: function ({commit, getters, state, dispatch}, {userProfileId}) {
    return new Promise((resolve, reject) => {
      let promises = []

      // skillCategories
      promises.push(dispatch('getEditSkillCategories', {userProfileId}))

      // // skills
      promises.push(dispatch('getEditSkills', {userProfileId}))

      // // skillDetails
      promises.push(dispatch('getEditSkillDetails', {userProfileId}))

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
