// BEGIN helpers
import axios from 'axios'
import he from 'he'

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

const getBlankExpert = () => {
  return {
    userProfileId: null,
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
    available_start: 8,
    available_end: 16,
    available_sun: null,
    available_mon: true,
    available_tue: true,
    available_wed: true,
    available_thu: true,
    available_fri: true,
    available_sat: null,
    phone: null
  }
}

const getBlankResume = () => {
  return {
    name: '',
    expertise: {
      skills: [],
      industries: []
    },
    employers: [],
    comment_resume_skills: '',
    comment_resume_history: '',
    comment_resume_education: ''
  }
}

const buildGetString = (query) => {
  // TODO: add to a store helper mixin
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

const getBlankSearchQuery = () => {
  return {
    status: 'unverified,probation,normal',
    name: '',
    skill_category_id: '',
    skill_ids: [],
    skill_detail_ids: [],
    locationId: ''
  }
}

const hasValue = (val) => {
  if (Array.isArray(val) && val.length) {
    return true
  }
  if (!Array.isArray(val) && val) {
    return true
  }
  return false
}

// END helpers

const state = {
  mine: getBlankExpert(),
  edit: getBlankExpert(),
  initMyData: false,
  searchQuery: getBlankSearchQuery(),
  experts: []
}

const mutations = {
  setMine (state, { expert }) {
    state.mine = expert
  },
  initMyData (state) {
    state.initMyData = true
  },
  setEdit (state, { expert }) {
    state.edit = expert
  },
  setSearchQuery (state, newQuery) {
    let blankQuery = getBlankSearchQuery()
    Object.keys(blankQuery).forEach((key) => {
      state.searchQuery[key] = (newQuery.hasOwnProperty(key) && hasValue(newQuery[key])) ? newQuery[key] : blankQuery[key]
    })
  },
  setExperts (state, experts) {
    state.experts = experts
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
  availableHours: (state) => (which) => {
    let obj = which || 'mine'
    return translateTime(state[obj].available_start) + ' to ' + translateTime(state[obj].available_end)
  },
  availableDays: (state, getters, rootState) => (which) => {
    let obj = which || 'mine'
    let availDays = []
    for (let i = 0; i < rootState.vars.days.length; i++) {
      if (state[obj]['available_' + rootState.vars.days[i].toLowerCase()]) {
        availDays.push(rootState.vars.days[i])
      }
    }
    return availDays.join(', ')
  },
  resumeData: (state, getters, rootState, rootGetters) => {
    let resume = getBlankResume()
    resume.name = rootState.userProfile.edit.name_first + ' ' + (rootState.userProfile.edit.name_last ? rootState.userProfile.edit.name_last.substr(0, 1) + '.' : '')
    resume.comment_resume_skills = state.edit.comment_resume_skills
    resume.comment_resume_history = state.edit.comment_resume_history
    resume.comment_resume_education = state.edit.comment_resume_education
    let industriesObjects = rootGetters['vars/industriesById']({industryIds: rootState.expertIndustries.industries})
    for (let i = 0; i < industriesObjects.length; i++) {
      resume.expertise.industries.push(he.decode(industriesObjects[i].title))
    }
    let tempSkills = rootState.expertSkills.skills
    let tempGroups
    for (let i = 0; i < tempSkills.length; i++) {
      resume.expertise.skills.push({
        title: he.decode(rootGetters['vars/skillsById']({skillId: tempSkills[i].skill_id}).title),
        detailGroups: []
      })
      tempGroups = rootGetters['vars/detailsByIdBySkillId']({skillId: tempSkills[i].skill_id, details: rootState.expertSkills.details})
      for (let j = 0; j < tempGroups.length; j++) {
        resume.expertise.skills[i].detailGroups.push({
          title: tempGroups[j].title,
          details: []
        })
        for (let k = 0; k < tempGroups[j].details.length; k++) {
          resume.expertise.skills[i].detailGroups[j].details.push(tempGroups[j].details[k].title)
        }
      }
    }
    let tempHistory = rootState.expertHistory.employers
    for (let i = 0; i < tempHistory.length; i++) {
      resume.employers.push({
        name: tempHistory[i].name,
        dates: tempHistory[i].startYYYYMM + ' - ' + (tempHistory[i].endYYYYMM ? tempHistory[i].endYYYYMM : 'present'),
        hourlyRate: tempHistory[i].pay_rate
      })
    }

    // employers: [],
    return resume
  }
}

const actions = {
  myExpert ({ commit, getters }) {
    return new Promise((resolve, reject) => {
      axios.get(getters.baseUrl + '/me', getters.headers)
        .then(({ data }) => {
          console.log(data)
          commit('setMine', {expert: data.expert})
          resolve()
        })
        .catch((error) => {
          console.error('Error getting expert data.', error)
          reject(error)
        })
    })
  },
  updateMyExpert ({ commit, getters }, {expert}) {
    return new Promise((resolve, reject) => {
      axios.post(getters.baseUrl + '/me', {expert}, getters.headers)
        .then(({ data }) => {
          console.log(data)
          commit('setMine', {expert: data.expert})
          resolve()
        })
        .catch((error) => {
          console.error('Error updating expert data', error)
          reject(error)
        })
    })
  },
  updateMyExpertPhoto ({ commit, getters }, {photo}) {
    return new Promise((resolve, reject) => {
      axios.post(getters.baseUrl + '/me/photo', {photo}, getters.headers)
        .then(({ data }) => {
          let expert = data.expert
          expert.photo_url += '?timestamp=' + Date.now()
          commit('setMine', {expert})
          resolve()
        })
        .catch((error) => {
          console.error('Error updating expert photo', error)
          reject(error)
        })
    })
  },
  removeMyExpertPhoto ({ commit, getters }) {
    return new Promise((resolve, reject) => {
      axios.delete(getters.baseUrl + '/me/photo', getters.headers)
        .then(({ data }) => {
          let expert = data.expert
          commit('setMine', {expert})
          resolve()
        })
        .catch((error) => {
          console.error('Error updating expert photo', error)
          reject(error)
        })
    })
  },
  initMyData ({ dispatch, commit, state }) {
    return new Promise((resolve, reject) => {
      if (!state.myDataInit) {
        dispatch('myExpert')
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
  getExpert ({ commit, getters }, {userProfileId}) {
    console.log('getExpert', userProfileId)
    return new Promise((resolve, reject) => {
      axios.get(getters.baseUrl + '/' + userProfileId, getters.headers)
        .then(({ data }) => {
          console.log(data)
          commit('setEdit', {expert: data.userExpert})
          resolve()
        })
        .catch((error) => {
          console.error('Error getting expert data.', error)
          reject(error)
        })
    })
  },
  updateExpert ({commit, getters}, {expert}) {
    return new Promise((resolve, reject) => {
      axios.put(getters.baseUrl + '/' + expert.userProfileId, {expert}, getters.headers)
        .then(({ data }) => {
          commit('setEdit', {expert: data.expert})
          resolve()
        })
        .catch((error) => {
          console.error('Error updating expert data', error)
          reject(error)
        })
    })
  },
  updateExpertPhoto ({ commit, getters }, {photo, expert, auth0SubId}) {
    return new Promise((resolve, reject) => {
      console.log('in updateExpertPhoto', expert)
      axios.post(getters.baseUrl + '/' + expert.userProfileId + '/photo', {photo, expert, auth0SubId}, getters.headers)
        .then(({ data }) => {
          let expert = data.expert
          expert.photo_url += '?timestamp=' + Date.now()
          commit('setEdit', {expert})
          resolve()
        })
        .catch((error) => {
          console.error('Error updating expert photo', error)
          reject(error)
        })
      console.log('after axios')
    })
  },
  removeExpertPhoto ({ commit, getters }, {userProfileId, expert}) {
    return new Promise((resolve, reject) => {
      axios.delete(getters.baseUrl + '/' + userProfileId + '/photo', getters.headers)
        .then(({ data }) => {
          expert.photo_url = 'none'
          commit('setEdit', {expert})
          resolve()
        })
        .catch((error) => {
          console.error('Error updating expert photo', error)
          reject(error)
        })
    })
  },
  getPDF ({getters, rootState}) {
    return new Promise((resolve, reject) => {
      axios.post(rootState.vars.functionsBase + '/postResume', {applicant: getters.resumeData}, {responseType: 'blob'})
        .then((response) => {
          // pilfered from https://gist.github.com/javilobo8/097c30a233786be52070986d8cdb1743
          const url = window.URL.createObjectURL(new Blob([response.data]))
          const link = document.createElement('a')
          link.href = url
          link.setAttribute('download', rootState.userProfile.edit.name_first + ' ' + (rootState.userProfile.edit.name_last ? rootState.userProfile.edit.name_last.substr(0, 1) : '') + '.pdf')
          document.body.appendChild(link)
          link.click()
          link.parentNode.removeChild(link)
        })
        .finally(() => {
          resolve()
        })
    })
  },
  search ({getters, commit, state}, {query}) {
    commit('setSearchQuery', query)
    return new Promise((resolve, reject) => {
      axios.get(`${getters.baseUrl}?${buildGetString(state.searchQuery)}`, getters.headers)
        .then(({data}) => {
          commit('setExperts', data.userExperts)
          resolve()
        })
        .catch((error) => {
          commit('setExperts', [])
          console.error('Error getting experts.', error)
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
