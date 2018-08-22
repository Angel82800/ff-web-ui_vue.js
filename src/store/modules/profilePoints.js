// BEGIN helpers

// END helpers
const state = {
  expert: {
    basic: {
      data: {
        done: false,
        points: 10
      },
      photo: {
        done: false,
        points: 10
      }
    },
    expertise: {
      skillCategories: {
        done: false,
        points: 10
      },
      skills: {
        done: false,
        points: 15
      },
      skillDetails: {
        done: false,
        points: 20
      },
      industries: {
        done: false,
        points: 5
      }
    },
    history: {
      experience: {
        done: false,
        points: 15
      }
      // ,
      // references: {
      //   done: false,
      //   points: 10
      // }
    },
    schedule: {
      availability: {
        done: false,
        points: 15
      }
    }
  }
}

const mutations = {

}

const getters = {
  basicDone (state)
}

const actions = {

}

const namespaced = true

export default {
  namespaced,
  actions,
  getters,
  mutations,
  state
}
