// BEGIN helpers
import axios from 'axios'

const getAuthGroups = () => {
  return [
    {
      id: 'Company Admin',
      description: 'Company/Employer'
    },
    {
      id: 'Expert',
      description: 'Skilled Professional'
    }
  ]
}

const getHours = () => {
  let hours = []
  for (let i = 0; i < 24; i++) {
    if (i === 0) {
      hours.push({value: i, text: '12 am'})
    } else if (i < 12) {
      hours.push({value: i, text: i + ' am'})
    } else if (i === 12) {
      hours.push({value: i, text: '12 pm'})
    } else {
      hours.push({value: i, text: (i - 12) + ' pm'})
    }
  }
  return hours
}

const getEmploymentYearRange = () => {
  let currentYear = new Date().getFullYear()
  let lastYear = 1990 // chosen by Patrick
  let years = []
  while (currentYear >= lastYear) {
    years.push(currentYear)
    currentYear--
  }
  return years
}

const getBaseUrl = () => {
  return process.env.API_BASE_URL
  // moved to webpack dev and production configs
  // switch (location.hostname) {
  //   case '2fers-dev.factoryfix.com':
  //     return 'https://ff-app-dev.appspot.com'
  //   case 'gigs.factoryfix.com':
  //     return 'https://ff-app-prod.appspot.com'
  //   default:
  //     return 'http://localhost'
  // }
}

const getPorts = () => {
  let ports = {
    vars: '',
    users: '',
    customers: ''
  }
  if (getBaseUrl() === 'http://localhost') {
    ports.vars = ':8044'
    ports.users = ':8043'
    ports.customers = ':8045'
  }
  return ports
}
// END helpers

const state = {
  authGroups: getAuthGroups(),
  hours: getHours(),
  days: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  months: [
    {value: '01', text: 'January'},
    {value: '02', text: 'February'},
    {value: '03', text: 'March'},
    {value: '04', text: 'April'},
    {value: '05', text: 'May'},
    {value: '06', text: 'June'},
    {value: '07', text: 'July'},
    {value: '08', text: 'August '},
    {value: '09', text: 'September'},
    {value: '10', text: 'October'},
    {value: '11', text: 'November'},
    {value: '12', text: 'December'}
  ],
  employmentYearRange: getEmploymentYearRange(),
  userProfileStatus: ['unverified', 'probation', 'normal', 'archive', 'suspend'],
  api: {
    version: 'v2',
    baseUrl: getBaseUrl(),
    ports: getPorts()
  },
  formRules: {
    required: (value) => !!value || 'Required.',
    email: (value) => {
      const pattern = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      return pattern.test(value) || 'Invalid e-mail.'
    },
    employmentDate: (value) => {
      if (typeof value !== 'undefined' && value !== null && value !== '') {
        if (value.length < 7) {
          return 'Input must be a four-digit year and a two-digit month (i.e. 2015-09)'
        }

        let monthPattern = /^((0[1-9])|(1[0-2]))/
        if (!monthPattern.test(value.substr(5, 2))) {
          return 'Month must be a two-digit value from 01 to 12'
        }

        let yearPattern = /^((19[0-9][0-9])|(20[0-9][0-9]))/
        if (!yearPattern.test(value.substr(0, 4))) {
          return 'Year must be a four-digit value from the current or last century'
        }

        if ((parseInt(value.substr(0, 4)) > (new Date()).getFullYear()) || (parseInt(value.substr(0, 4)) === (new Date()).getFullYear() && parseInt(value.substr(5, 2)) > (parseInt((new Date()).getMonth()) + 1))) {
          return 'Date must not be in the future'
        }
      }
      return true
    }
  },
  googlePlacesKey: location.hostname === 'gigs.factoryfix.com' ? 'AIzaSyAU6-T9nF9JsT2tg0bFo4RJ8-kx0IVV0io' : 'AIzaSyDtbO9wwmp6XhfAed0zg5UM3o7C3tfbnVQ',
  colors: {
    baseGreen: '6DAB3C'
  },
  initMaxAge: 45 * 1000, // 45 seconds
  initStatus: false,
  expertise: {
    categories: [],
    skills: [],
    detailGroups: [],
    details: [],
    industries: [],
    skillLevels: ['None', '&lt; 3 yrs', '3-7 yrs', '7+ yrs']
  },
  warnings: {
    expert: {
      basic: 'Please provide location and contact information to get the most out of the FactoryFix service.',
      photo: 'When comparing applicants for a gig, employers are more likely to select an applicant with a photo.',
      history: 'Employment history is required when applying for a job. Add your experience so you are ready when a gig comes your way.',
      expertise: 'Industry and skill details help us provide the best information and potential gig matches possible.'
    }
  },
  gigStatusList: ['draft', 'review', 'live', 'expired', 'filled', 'complete', 'removed', 'archived'],
  gigStatusListVisible: ['draft', 'review', 'live', 'expired', 'filled', 'complete'],
  functionsBase: (location.hostname === '2fers-dev.factoryfix.com' || location.hostname === 'gigs.factoryfix.com') ? ((location.hostname === '2fers-dev.factoryfix.com') ? 'https://us-central1-ff-app-dev.cloudfunctions.net' : 'https://us-central1-ff-app-prod.cloudfunctions.net') : 'http://localhost:8010/labs-191219/us-central1'
}

const mutations = {
  setCategories (state, { categories }) {
    state.expertise.categories = categories
  },
  setSkills (state, { skills }) {
    state.expertise.skills = skills
  },
  setDetailGroups (state, { detailGroups }) {
    state.expertise.detailGroups = detailGroups
  },
  setDetails (state, { details }) {
    state.expertise.details = details
  },
  setIndustries (state, { industries }) {
    state.expertise.industries = industries
  },
  setInit (state, { status }) {
    state.initStatus = status
  }
}

const getters = {
  apiPort (state) {
    return (location.hostname === '2fers-dev.factoryfix.com' || location.hostname === 'gigs.factoryfix.com') ? '' : state.api.ports.vars
  },
  baseUrl (state, getters, rootState) {
    return rootState.vars.api.baseUrl + getters.apiPort + '/' + rootState.vars.api.version + '/vars'
  },
  headers (state, getters, rootState) {
    return {
      // headers: {
      //   Authorization: 'Bearer ' + rootState.auth.access_token
      // }
    }
  },
  categoriesById: (state) => ({categoryIds}) => {
    let result = state.expertise.categories.filter((category) => {
      return (categoryIds.indexOf(category.id) > -1)
    })
    return (result.length) ? result : [{title: 'No matching categories'}]
  },
  skillsById: (state) => ({skillId}) => {
    return state.expertise.skills.find((skill) => {
      return skill.id === skillId
    })
  },
  skillsByCategoryId: (state) => ({categoryId}) => {
    return state.expertise.skills.filter((skill) => {
      return skill.skill_category_id === categoryId
    })
  },
  skillsByIdsByCategoryId: (state, getters) => ({categoryId, skills}) => {
    let matches = []
    if (skills.length) {
      let categorySkills = getters.skillsByCategoryId({categoryId})
      matches = categorySkills.filter((skill) => {
        return skills.find((skillTest) => {
          return skillTest.skill_id === skill.id
        })
      })
    }
    return matches
  },
  detailGroupsBySkillId: (state) => ({skillId}) => {
    return state.expertise.detailGroups.filter((detailGroup) => {
      return detailGroup.skill_id === skillId
    })
  },
  detailsByIdBySkillId: (state, getters) => ({skillId, details}) => {
    let groupsWithDetails = []
    // which detail groups belong to the skill we are testing?
    let detailGroups = getters.detailGroupsBySkillId({skillId})

    // which details vars have we selected?
    let selectedDetails = state.expertise.details.filter((testDetail) => {
      let index = details.findIndex((detail) => {
        return detail.skill_detail_id === testDetail.id
      })
      return (index > -1)
    })

    // assign selected details to their groups
    detailGroups.forEach((detailGroup) => {
      groupsWithDetails.push({
        title: detailGroup.title,
        details: selectedDetails.filter((selectedDetail) => {
          return selectedDetail.skill_group_id === detailGroup.id
        })
      })
    })
    return groupsWithDetails
  },
  detailsByGroupId: (state) => (groupId) => {
    return state.expertise.details.filter((detail) => {
      return detail.skill_group_id === groupId
    })
  },
  skillsHaveDetails: (state) => ({skillIds}) => {
    for (let i = 0; i < state.expertise.detailGroups.length; i++) {
      if (skillIds.indexOf(state.expertise.detailGroups[i].skill_id) > -1) {
        return true
      }
    }
    return false
  },
  skillDetailName: (state) => ({skillDetailId}) => {
    let detail = state.expertise.details.find((detail) => {
      return detail.id === skillDetailId
    })
    if (detail) {
      let group = state.expertise.detailGroups.find((group) => {
        return group.id === detail.skill_group_id
      })
      if (group) {
        let skill = state.expertise.skills.find((skill) => {
          return skill.id === group.skill_id
        })
        if (skill) {
          return skill.title + ': ' + detail.title
        }
      }
      return detail.title
    }
    return 'Skill name not found'
  },
  industriesById: (state) => ({industryIds}) => {
    return state.expertise.industries.filter((industry) => {
      return (industryIds.indexOf(industry.id) > -1)
    })
  },
  cleanedAlphaName: () => (alphaName) => {
    if (alphaName) {
      return alphaName.replace(/^(zzz)(.+)/, (match, zs, remainder) => {
        return remainder
      })
    }
  }
}

const actions = {
  checkInit: function ({commit, getters, state, dispatch}) {
    return new Promise((resolve, reject) => {
      // if there is a current init process that started but did not finish, it will be a unix timestamp. If it is too old, bounce it
      if (state.initStatus !== false && state.initStatus !== true) {
        // check age
        let ts = (new Date()).getTime()
        if (state.initStatus + state.initMaxAge < ts) {
          // timed out
          commit('setInit', {status: false})
          resolve()
        } else {
          setTimeout(function () {
            dispatch('checkInit')
              .then(() => {
                resolve()
              })
          }, 2000)
        }
      } else {
        resolve()
      }
    })
  },
  initData: function ({commit, getters, state, dispatch}) {
    return new Promise((resolve, reject) => {
      dispatch('checkInit')
        .then(() => {
          if (!state.initStatus) {
            commit('setInit', {status: (new Date()).getTime()})
            let promises = []
            // skillCategories
            let p1 = new Promise((resolve, reject) => {
              axios.get(getters.baseUrl + '/skillCategories', getters.headers)
                .then(({ data }) => {
                  commit('setCategories', {categories: data.categories})
                  resolve()
                })
                .catch((error) => {
                  console.error('Error getting category data.', error)
                  reject(error)
                })
            })
            promises.push(p1)

            // skills
            let p2 = new Promise((resolve, reject) => {
              axios.get(getters.baseUrl + '/skills', getters.headers)
                .then(({ data }) => {
                  commit('setSkills', {skills: data.skills})
                  resolve()
                })
                .catch((error) => {
                  console.error('Error getting skill data.', error)
                })
            })
            promises.push(p2)

            // skillDetailGroups
            let p3 = new Promise((resolve, reject) => {
              axios.get(getters.baseUrl + '/skillDetailGroups', getters.headers)
                .then(({ data }) => {
                  commit('setDetailGroups', {detailGroups: data.detailGroups})
                  resolve()
                })
                .catch((error) => {
                  console.error('Error getting detail group data.', error)
                })
            })
            promises.push(p3)

            // skillDetails
            let p4 = new Promise((resolve, reject) => {
              axios.get(getters.baseUrl + '/skillDetails', getters.headers)
                .then(({ data }) => {
                  commit('setDetails', {details: data.details})
                  resolve()
                })
                .catch((error) => {
                  console.error('Error getting detail data.', error)
                })
            })
            promises.push(p4)

            // industries
            let p5 = new Promise((resolve, reject) => {
              axios.get(getters.baseUrl + '/industries', getters.headers)
                .then(({ data }) => {
                  commit('setIndustries', {industries: data.industries})
                  resolve()
                })
                .catch((error) => {
                  console.error('Error getting industry data.', error)
                })
            })
            promises.push(p5)

            Promise.all(promises)
              .then(() => {
                commit('setInit', {status: true})
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
