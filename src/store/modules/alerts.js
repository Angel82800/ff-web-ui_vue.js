// BEGIN helpers
const getBlankAlert = () => {
  return {
    active: false,
    y: 'top',
    x: null,
    mode: 'multi-line',
    timeout: 0,
    text: ''
  }
}
// END helpers

const state = {
  alert: getBlankAlert()
}

const mutations = {
  setActive: (state, { active }) => {
    state.alert.active = active
  },
  setText: (state, { text }) => {
    state.alert.text = text
  }
}

const actions = {
  close: ({commit}) => {
    commit('setActive', {active: false})
    commit('setText', {text: ''})
  },
  publish: ({commit}, {text}) => {
    commit('setActive', {active: false})
    commit('setText', {text})
    commit('setActive', {active: true})
  }
}

const namespaced = true

export default {
  state,
  mutations,
  actions,
  namespaced
}
