// BEGIN helpers
import axios from 'axios'

const getBlankProfile = () => {
  return {
    id: null,
    auth0_sub_id: null,
    name_first: null,
    name_last: null,
    email: null,
    auth0_avatar: null,
    uploaded_photo: null,
    status: 'probation',
    type: null
  }
}

const getBlankSearchQuery = () => {
  return {
    status: 'unverified,probation,normal',
    name: ''
  }
}

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

// END helpers

const state = {
  mine: getBlankProfile(),
  searchQuery: getBlankSearchQuery(),
  users: [],
  edit: getBlankProfile()
}

const mutations = {
  setMine (state, { profile }) {
    // TODO: dirty fix until we get things right on the server
    if (Array.isArray(profile)) {
      profile = profile[0]
    }
    // TODO: hack until we have more time to understand Intercom plugin
    // TODO: get hash in here -- needs to be created on server
    window.Intercom('update', {
      name: profile.name_first + ' ' + profile.name_last,
      email: profile.email,
      vertical_padding: 45
    })
    state.mine = profile
  },
  setMineNameFirst (state, nameFirst) {
    state.mine.name_first = nameFirst
  },
  setMineNameLast (state, nameLast) {
    state.mine.name_last = nameLast
  },
  setMineEmail (state, email) {
    state.mine.email = email
  },
  setMineUploadedPhoto (state, photoUrl) {
    state.mine.uploaded_photo = photoUrl
  },
  setSearchQuery (state, newQuery) {
    let blankQuery = getBlankSearchQuery()
    Object.keys(blankQuery).forEach((key) => {
      state.searchQuery[key] = (newQuery.hasOwnProperty(key)) ? newQuery[key] : blankQuery[key]
    })
  },
  setUsers (state, users) {
    state.users = users
  },
  setEdit (state, { profile }) {
    state.edit = profile
  },
  replaceUser (state, { profile }) {
    let index = state.users.findIndex((user) => {
      return user.id === profile.id
    })
    if (index > -1) {
      state.users.splice(index, 1, profile)
    }
  },
  removeUser (state, {userProfileId}) {
    let index = state.users.findIndex((user) => {
      return user.id === userProfileId
    })
    if (index > -1) {
      state.users.splice(index, 1)
    }
  },
  setUserGroup (state, {groupId, userProfileId}) {
    let index = state.users.findIndex((user) => {
      return user.id === userProfileId
    })

    if (index > -1) {
      let profile = state.users[index]
      state.users[index].userType = groupId
      state.users.splice(index, 1, profile)
    }
  }
}

const getters = {
  apiPort (state, getters, rootState) {
    return (location.hostname === '2fers-dev.factoryfix.com' || location.hostname === 'gigs.factoryfix.com') ? '' : rootState.vars.api.ports.users
  },
  baseUrl (state, getters, rootState) {
    return rootState.vars.api.baseUrl + getters.apiPort + '/' + rootState.vars.api.version + '/users'
  },
  headers (state, getters, rootState) {
    return {
      headers: {
        Authorization: 'Bearer ' + rootState.auth.access_token
      }
    }
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
  getUserById: (state) => (userProfileId) => {
    let index = state.users.findIndex((user) => {
      return user.id === parseInt(userProfileId)
    })
    return index > -1 ? state.users[index] : false
  }
}

const actions = {
  myProfile ({ commit, getters, rootGetters, dispatch }) {
    axios.get(getters.baseUrl + '/me', getters.headers)
      .then(({ data }) => {
        console.log('myProfile', data)
        // a fix for missing email addresses
        if (!data.user_profile.email) {
          let newEmail = rootGetters['auth/getEmailFromAccessToken']
          if (newEmail) {
            // update this in the background
            data.user_profile.email = newEmail
            dispatch('updateMyProfile', {userProfile: data.user_profile})
          }
        }
        commit('setMine', {
          profile: data.user_profile,
          meta: {
            analytics: [
              ['event', {
                eventCategory: 'Session',
                eventAction: 'Login'
              }],
              ['set', {
                userId: data.user_profile.auth0_sub_id
              }]
            ]
          }
        })
      })
      .catch((error) => {
        console.error('Error getting user profile.', error)
      })
  },
  updateMyProfile ({ commit, getters }, {userProfile}) {
    return new Promise((resolve, reject) => {
      if (!getters.dataCompare('mine', userProfile)) {
        axios.put(getters.baseUrl + '/me', {userProfile}, getters.headers)
          .then(({ data }) => {
            console.log('updateMyProfile', data)
            commit('setMine', {profile: data.user_profile})
            resolve()
          })
          .catch((error) => {
            console.error('Error updating user profile.', error)
            reject(error)
          })
      } else {
        resolve()
      }
    })
  },
  logout ({ commit, state }) {
    commit('setMine', {
      profile: getBlankProfile(),
      meta: {
        analytics: [
          ['event', {
            eventCategory: 'Session',
            eventAction: 'Logout'
          }],
          ['set', {
            userId: ''
          }]
        ]
      }
    })
  },
  getUsers: function ({commit, getters}, {query}) {
    commit('setSearchQuery', query)
    return new Promise((resolve, reject) => {
      axios.get(`${getters.baseUrl}?${buildGetString(query)}`, getters.headers)
        .then(({data}) => {
          commit('setUsers', data.users)
          resolve()
        })
        .catch((error) => {
          console.error('Error getting users.', error)
          reject(error)
        })
    })
  },
  updateProfile: function ({commit, getters}, {userProfile}) {
    return new Promise((resolve, reject) => {
      console.log('about to update user profile', userProfile)
      if (!getters.dataCompare('edit', userProfile)) {
        axios.put(getters.baseUrl + '/' + userProfile.id, {userProfile}, getters.headers)
          .then(({ data }) => {
            commit('setEdit', {profile: userProfile})
            commit('replaceUser', {profile: userProfile})
            resolve()
          })
          .catch((error) => {
            console.error('Error updating user profile.', error)
            reject(error)
          })
      } else {
        resolve()
      }
    })
  },
  deleteProfile: function ({commit, getters}, {userProfileId}) {
    return new Promise((resolve, reject) => {
      console.log('about to delete user id', userProfileId)
      axios.delete(getters.baseUrl + '/' + userProfileId, getters.headers)
        .then(({data}) => {
          commit('removeUser', {userProfileId})
          resolve()
        })
        .catch((error) => {
          console.log('Error deleting user profile.', error)
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
