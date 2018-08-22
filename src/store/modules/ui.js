
const state = () => ({
  navContent: false, // show content nav (left)?
  navSettings: false, // show settings nav (right)?
  mobileBreakPoint: 1100, // how big should the window be before no longer hiding left nav
  windowWidth: 0 // what is the current window width?
})

const mutations = {
  toggleNavContent (state, newVal) {
    state.navContent = newVal
  },
  toggleNavSettings (state, newVal) {
    state.navSettings = newVal
  },
  setWindowWidth (state, newWidth) {
    state.windowWidth = newWidth
  }
}

const namespaced = true

export default {
  namespaced,
  state,
  mutations
}
