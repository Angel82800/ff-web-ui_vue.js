// BEGIN helpers
import axios from 'axios'
import auth0 from '@/apis/auth0'
import jwtDecode from 'jwt-decode'

const state = {
  groups: [],
  access_token: '',
  id_token: '',
  expires_at: ''
}

const getters = {
  isAuthenticated (state) {
    if (new Date().getTime() < state.expires_at) {
      return true
    }
    return false
  },
  expiresAt (state) {
    return state.expires_at
  },
  hasGroup: (state, getters) => (group) => {
    let groups = state.groups
    if (getters.isAuthenticated && (groups.indexOf(group) > -1)) {
      return true
    }
    return false
  },
  getEmailFromAccessToken (state) {
    if (state.access_token) {
      let decodedAuth = jwtDecode(state.access_token)
      if (decodedAuth.hasOwnProperty('https://ff-app-dev.appspot.com/email')) {
        return decodedAuth['https://ff-app-dev.appspot.com/email']
      }
      if (decodedAuth.hasOwnProperty('https://ff-app-prod.appspot.com/email')) {
        return decodedAuth['https://ff-app-prod.appspot.com/email']
      }
    }
    return ''
  }
}

const mutations = {
  setGroups (state, groups) {
    state.groups = groups
  },
  setAccessToken (state, accessToken) {
    state.access_token = accessToken
  },
  setIdToken (state, idToken) {
    state.id_token = idToken
  },
  setExpiresAt (state, { expiresAt, expiresIn }) {
    state.expires_at = expiresAt
  },
  removeGroups (state, groups) {
    state.groups = []
  },
  removeAccessToken (state) {
    state.access_token = ''
  },
  removeIdToken (state) {
    state.id_token = ''
  },
  removeExpiresAt (state) {
    state.expires_at = ''
  }
}

const actions = {
  checkAuth ({commit, getters}) {
    if (getters.isAuthenticated()) {
      return true
    }
    commit('logout') // TODO: this ain't right (why not? why did I leave this comment? AGH!)
    return false
  },
  setSession ({ commit, dispatch }, authResult) {
    // Set the time that the access token will expire at
    let expiresAt = JSON.stringify(
      authResult.expiresIn * 1000 + new Date().getTime()
    )
    console.log(authResult.accessToken)
    commit('setAccessToken', authResult.accessToken)
    commit('setIdToken', authResult.idToken)
    let decodedID = jwtDecode(authResult.idToken)
    console.log('auth.setSession', decodedID)
    let groups = (decodedID.hasOwnProperty(auth0.ID_TOKEN_GROUPS_IDX)) ? decodedID[auth0.ID_TOKEN_GROUPS_IDX] : []
    commit('setGroups', groups)
    commit('setExpiresAt', { expiresAt, expiresIn: authResult.expiresIn })
    dispatch('initData')
  },
  logout ({ commit, dispatch, getters }) {
    switch (true) {
      case (getters.hasGroup('Super Admin')):
        break
      case (getters.hasGroup('Company Admin')):
        dispatch('customer/clearMyData', {}, {root: true})
        dispatch('customerGigs/clearMyData', {}, {root: true})
        break
      case (getters.hasGroup('Expert')):
      // TODO
        // dispatch('expert/clearMyData', {}, {root: true})
        // dispatch('expertSkills/clearMyData', {}, {root: true})
        // dispatch('expertIndustries/clearMyData', {}, {root: true})
        // dispatch('expertHistory/clearMyData', {}, {root: true})
        break
    }
    commit('removeGroups')
    commit('removeAccessToken')
    commit('removeIdToken')
    commit('removeExpiresAt')
    dispatch('userProfile/logout', {}, {root: true})
  },
  // if the user does not already have a group assigned,
  // hit user API to assign new group and then handle response
  // TODO: pretty up with user notifications of progress in UI component
  updateMyGroup ({ commit, rootGetters }, { groupId }) {
    let currGroups = this.state.auth.groups
    return new Promise((resolve, reject) => {
      if (currGroups.length !== 0) {
        console.log('no need to update group since I already have', currGroups)
        resolve() // not sure how we ended up here, but we're not going to screw with anything.
      } else {
        let headers = {
          Authorization: 'Bearer ' + this.state.auth.access_token,
          'Content-Type': 'application/json'
        }
        axios.post(rootGetters['userProfile/baseUrl'] + '/me/group', {group: groupId}, {headers: headers})
          .then((response) => {
            // do a commit. this data is kept in auth as Auth0 actualy manages it
            commit('setGroups', [groupId])
            resolve()
          })
          .catch((error) => {
            reject(error)
          })
      }
    })
  },
  updateGroup ({ commit, rootGetters, dispatch }, { userProfileId, groupId, auth0SubId }) {
    return new Promise((resolve, reject) => {
      let headers = {
        Authorization: 'Bearer ' + this.state.auth.access_token,
        'Content-Type': 'application/json'
      }
      axios.post(rootGetters['userProfile/baseUrl'] + '/' + userProfileId + '/group', {groupId, auth0_sub_id: auth0SubId}, {headers: headers})
        .then((response) => {
          commit('userProfile/setUserGroup', {groupId, userProfileId}, {root: true})
          resolve()
        })
        .catch((error) => {
          reject(error)
        })
    })
  },
  initData ({dispatch, getters}) {
    dispatch('userProfile/myProfile', {}, {root: true})
    dispatch('vars/initData', {}, {root: true})
    switch (true) {
      case (getters.hasGroup('Super Admin')):
        break
      case (getters.hasGroup('Company Admin')):
        dispatch('customer/initMyData', {}, {root: true})
        dispatch('customerGigs/initMyData', {}, {root: true})
        dispatch('customerIndustries/initMyData', {}, {root: true})
        dispatch('customerSkills/initMyData', {}, {root: true})
        break
      case (getters.hasGroup('Expert')):
        dispatch('expert/initMyData', {}, {root: true})
        dispatch('expertSkills/initMyData', {}, {root: true})
        dispatch('expertIndustries/initMyData', {}, {root: true})
        dispatch('expertHistory/initMyData', {}, {root: true})
        break
    }
  }
}

const namespaced = true

export default {
  namespaced,
  state,
  getters,
  mutations,
  actions
}
