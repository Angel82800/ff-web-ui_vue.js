<template>
  <v-card flat>
    <v-card-actions class="mb-3">
      <v-btn :loading="form_loading" :disabled="!form_valid || form_loading" @click="setStep(parseInt(step) - 1)" color="primary"><v-icon left dark>arrow_back</v-icon><span class="hidden-xs-only">{{ backButton }}</span></v-btn>
      <v-spacer></v-spacer>
      <p class="title hidden-xs-only">
        Expertise ({{ step }} of 4)
      </p>
      <v-spacer class="hidden-xs-only"></v-spacer>
      <v-btn :loading="form_loading" :disabled="!form_valid || form_loading" @click="setStep(parseInt(step) + 1)" color="primary"><span class="hidden-xs-only">{{ forwardButton }}</span><v-icon right dark>arrow_forward</v-icon></v-btn>
    </v-card-actions>

    <p class="title hidden-sm-and-up">
      Expertise ({{ step }} of 4)
    </p>

    <transition name="fade" mode="out-in">

      <div v-if="step === 1" key="1">
        <p class="headline">
          Pick the one category that best represents your skills and experience.
        </p>
        <v-container fluid grid-list-md class="mb-3">
          <v-layout row wrap>
            <v-flex xs12 sm6 v-for="(category, index) in categories" :key="index" d-flex>
              <v-card class="ease-in-out" :color="categoryState(index) ? 'primary': ''" :dark="categoryState(index)" @click.native="toggleCategory(index)">
                <v-card-text>
                  <h1 v-html="category.title"></h1>
                  <p v-html="category.description"></p>
                </v-card-text>
              </v-card>
            </v-flex>
          </v-layout>
        </v-container>
      </div>

      <div v-if="step === 2" key="2">
        <p class="headline">
          Select your skills and years of experience.
        </p>
        <div class="text-xs-left mb-5 mt-4">
          <div class="mb-5" v-for="(catId, catIndex) in selectedCategories" :key="catIndex">
            <!-- <h1 class="grey--text text--darken-1" v-html="categories[catId].title"></h1> -->
            <div class="mt-2 mb-3" v-for="(skill, skillIndex) in categorySkills(categories[catId].id)" :key="skillIndex">
              <h2 v-html="skill.title"></h2>
              <v-btn-toggle v-model="skill.level" class="button-bar-flex button-bar-primary mt-2 mb-2">
                <v-btn v-for="(level, levelIndex) in expertise.skillLevels" :key="levelIndex" :disabled="form_loading" block :value="levelIndex">
                  <div v-html="expertise.skillLevels[levelIndex]"></div>
                </v-btn>
              </v-btn-toggle>
            </div>
          </div>
        </div>
      </div>

      <div v-if="step === 3" key="3">
        <p class="headline">
          Tell us more about your skills.
        </p>
        <div class="text-xs-left mb-5 mt-4">
          <div class="mb-2" v-for="(skill, skillIndex) in selectedSkills" :key="skillIndex">
            <h1 class="grey--text text--darken-1" v-html="skillTitle(skill.skill_id)"></h1>
            <div class="mt-1 mb-4" v-for="(skillDetailGroup, skillDetailGroupIndex) in skillDetailGroups(skill.skill_id)" :key="skillDetailGroupIndex">
              <h2 class="grey--text" v-html="skillDetailGroup.title"></h2>
              <v-btn
                v-for="(skillDetail, skillDetailIndex) in detailsByGroupId(skillDetailGroup.id)"
                :key="skillDetailIndex"
                outline
                :disabled="form_loading"
                :color="detailState(skillDetail.id) ? 'primary': ''"
                :dark="!form_loading && (detailState(skillDetail.id) ? true : false)"
                @click="toggleDetail(skillDetail.id)"
              >
                <!--
                  :disabled="detailsProcessing({detailId: skillDetail.id})"
                  :loading="detailsProcessing({detailId: skillDetail.id})"
                  :color="detailsById({detailId: skillDetail.id}) ? 'primary': ''"
                  :dark="!form_loading && detailsById({detailId: skillDetail.id})"
                -->
                <span v-html="cleanedAlphaName(skillDetail.title)"></span>
                <v-icon right dark v-html="detailState(skillDetail.id) ? 'check_box' : 'check_box_outline_blank'">check_box_outline_blank</v-icon>
              </v-btn>
            </div>
          </div>
        </div>
      </div>

      <div v-if="step === 4" key="4">
        <p class="headline">
          What industries have you worked in?
        </p>
        <v-btn outline :disabled="form_loading" v-for="(industry, index) in industries" :key="industry.id" :color="industryState(index) ? 'primary': ''" :dark="!form_loading && (industryState(index) ? true : false)" @click.native="toggleIndustry(index)">
          <span v-html="cleanedAlphaName(industry.title)"></span>
          <v-icon v-html="industryState(index) ? 'check_box' : 'check_box_outline_blank'" right dark>check</v-icon>
        </v-btn>
      </div>

    </transition>

    <v-card-actions class="mb-3">
      <v-btn :loading="form_loading" :disabled="!form_valid || form_loading" @click="setStep(parseInt(step) - 1)" color="primary"><v-icon left dark>arrow_back</v-icon><span class="hidden-xs-only">{{ backButton }}</span></v-btn>
      <v-spacer></v-spacer>
      <v-btn :loading="form_loading" :disabled="!form_valid || form_loading" @click="setStep(parseInt(step) + 1)" color="primary"><span class="hidden-xs-only">{{ forwardButton }}</span><v-icon right dark>arrow_forward</v-icon></v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
import {mapState, mapGetters} from 'vuex'
export default {
  data () {
    return {
      step: 1,
      categories: [],
      skills: [],
      industries: [],
      skillBtnBarVals: [],
      detailsState: [],
      form_loading: false
    }
  },
  // created () {
  // },
  mounted () {
    this.form_loading = true
    // make sure we have the data for this step
    let self = this
    let promises = []
    promises.push(self.$store.dispatch('vars/initData'))
    promises.push(self.$store.dispatch('expertSkills/initMyData'))
    promises.push(self.$store.dispatch('expertIndustries/initMyData'))

    Promise.all(promises)
      .then(() => {
        // we want a copy of the data that we can do with as we please
        for (let i = 0; i < self.$store.state.vars.expertise.categories.length; i++) {
          self.categories.push({
            id: self.$store.state.vars.expertise.categories[i].id,
            title: self.$store.state.vars.expertise.categories[i].title,
            description: self.$store.state.vars.expertise.categories[i].description,
            selected: self.$store.getters['expertSkills/categorySelected'](self.$store.state.vars.expertise.categories[i].id)
          })
        }
      })
      .catch((error) => {
        console.error(error)
      })
      .finally(() => {
        self.form_loading = false
      })
  },
  computed: {
    form_valid: function () {
      switch (this.step) {
        case 1:
          for (let i = 0; i < this.categories.length; i++) {
            if (this.categories[i].selected) {
              return true
            }
          }
          return false
        case 2:
          for (let i = 0; i < this.skills.length; i++) {
            if (parseInt(this.skills[i].level) > 0) {
              return true
            }
          }
          return false
        case 3:
          let testGroups, testDetails, testSome
          for (let i = 0; i < this.selectedSkills.length; i++) {
            testGroups = this.skillDetailGroups(this.selectedSkills[i].skill_id)
            for (let j = 0; j < testGroups.length; j++) {
              testDetails = this.detailsByGroupId(testGroups[j].id)
              for (let k = 0; k < testDetails.length; k++) {
                testSome = this.selectedDetails.some((detailId) => {
                  return detailId === testDetails[k].id
                })
                if (testSome) {
                  k = testDetails.length
                }
              }
              if (!testSome) {
                return false
              }
            }
          }
          return true
        case 4:
          for (let i = 0; i < this.industries.length; i++) {
            if (this.industries[i].selected) {
              return true
            }
          }
          return false
      }
    },
    backButton: function () {
      // TODO: based on step, return what should be on the back button
      switch (this.step) {
        case 1:
          return 'Step 1'
        case 2:
          return 'Category'
        case 3:
          return 'Skills'
        case 4:
          return this.hasDetails ? 'Details' : 'Skills'
      }
    },
    forwardButton: function () {
      // TODO: based on step, return what should be on the forward button
      switch (this.step) {
        case 1:
          return 'Skills'
        case 2:
          return this.hasDetails ? 'Details' : 'Industries'
        case 3:
          return 'Industries'
        case 4:
          return 'Step 3'
      }
    },
    hasDetails: function () {
      // check for details on this.selectedSkills
      if (this.selectedSkills.length) {
        let skillIds = []
        for (let i = 0; i < this.selectedSkills.length; i++) {
          skillIds.push(this.selectedSkills[i].skill_id)
        }
        return this.$store.getters['vars/skillsHaveDetails']({skillIds})
      }
      return false
    },
    selectedDetails: function () {
      let selectedDetailIds = []
      for (let i = 0; i < this.detailsState.length; i++) {
        if (this.detailsState[i].selected) {
          selectedDetailIds.push(this.detailsState[i].skill_detail_id)
        }
      }
      return selectedDetailIds
    },
    primary: function () {
      return this.$vuetify.theme.primary
    },
    selectedCategories: function () {
      let sel = []
      for (let i = 0; i < this.categories.length; i++) {
        if (this.categories[i].selected) {
          sel.push(i)
        }
      }
      return sel
    },
    selectedSkills: function () {
      let self = this
      let selectedSkills = []
      // gather the skills that do not have a level of '0'
      for (let i = 0; i < self.skills.length; i++) {
        if (parseInt(self.skills[i].level) > 0) {
          selectedSkills.push({skill_id: self.skills[i].skill_id, level: parseInt(self.skills[i].level)}) // form turns it into a str. we're tuning it back
        }
      }
      return selectedSkills
    },
    selectedIndustries: function () {
      let sel = []
      for (let i = 0; i < this.industries.length; i++) {
        if (this.industries[i].selected) {
          sel.push(i)
        }
      }
      return sel
    },
    ...mapState('expertSkills', ['details']),
    ...mapState('vars', ['expertise']),
    ...mapGetters('expertSkills', ['detailsById', 'isSelected']),
    ...mapGetters('vars', ['detailsByGroupId', 'cleanedAlphaName'])
  },
  methods: { // TODO: refactor a lot of this stuff back up into the state getters
    detailState: function (detailId) {
      let index = this.detailsState.findIndex(detail => {
        return detail.skill_detail_id === detailId
      })
      return index > -1 ? this.detailsState[index].selected : false
    },
    toggleDetail: function (detailId) {
      if (!this.form_loading) {
        let index = this.detailsState.findIndex(detail => {
          return detail.skill_detail_id === detailId
        })
        this.detailsState[index].selected = !this.detailsState[index].selected
      }
    },
    // toggleDetails: function (detailId) {
    //   if (this.detailsById({detailId})) {
    //     this.deleteDetails(detailId)
    //   } else {
    //     this.addDetails(detailId)
    //   }
    // },
    // addDetails: function (detailId) {
    //   let self = this
    //   self.form_loading = true
    //   self.$store.commit('expertSkills/addDetailsProcessing', {detailId})
    //   self.$store.dispatch('expertSkills/addMyDetails', {detailId: detailId})
    //     .then(() => {
    //       self.$store.commit('expertSkills/deleteDetailsProcessing', {detailId})
    //     })
    //     .catch((error) => {
    //       console.error(error)
    //     })
    //     .finally(() => {
    //       self.form_loading = false
    //     })
    // },
    // deleteDetails: function (detailId) {
    //   let self = this
    //   self.form_loading = true
    //   self.$store.commit('expertSkills/addDetailsProcessing', {detailId})
    //   self.$store.dispatch('expertSkills/deleteMyDetails', {detailId: detailId})
    //     .then(() => {
    //       self.$store.commit('expertSkills/deleteDetailsProcessing', {detailId})
    //     })
    //     .catch((error) => {
    //       console.error(error)
    //     })
    //     .finally(() => {
    //       self.form_loading = false
    //     })
    // },
    skillDetails: function (skillGroupId) {
      return this.details.filter((detail) => {
        return detail.skill_group_id === skillGroupId
      })
    },
    skillDetailGroups: function (skillId) {
      return this.$store.state.vars.expertise.detailGroups.filter((detailGroup) => {
        return detailGroup.skill_id === skillId
      })
    },
    skillTitle: function (skillId) {
      let skill = this.skills.find((skill) => {
        return skill.skill_id === skillId
      })
      return skill.title
    },
    skillDetailGroupTitle: function (skillGroupId) {
      return 'placeholder'
    },
    categorySkills: function (categoryId) {
      return this.skills.filter((skill) => {
        return skill.skill_category_id === categoryId
      })
    },
    categoryState: function (index) {
      if (index < this.categories.length) {
        return this.categories[index].selected
      }
      return false
    },
    toggleCategory: function (index) {
      let changeTo
      if (!this.form_loading) {
        if (index < this.categories.length) {
          changeTo = !this.categories[index].selected
          if (changeTo) { // we're only allowing one to be selected, so if this is true, the others must be false
            for (let i = 0; i < this.categories.length; i++) {
              this.categories[i].selected = false
            }
          }
          this.categories[index].selected = changeTo
        }
      }
    },
    prepSkills: function () {
      this.skills = []
      for (let i = 0; i < this.$store.state.vars.expertise.skills.length; i++) {
        this.skills.push({
          skill_id: this.$store.state.vars.expertise.skills[i].id,
          skill_category_id: this.$store.state.vars.expertise.skills[i].skill_category_id,
          title: this.$store.state.vars.expertise.skills[i].title,
          level: this.$store.getters['expertSkills/skillLevel'](this.$store.state.vars.expertise.skills[i].id) // .toString()
        })
      }
    },
    prepDetails: function () {
      let self = this
      let detailGroups
      let details
      self.detailsState = []
      for (let i = 0; i < self.selectedSkills.length; i++) {
        detailGroups = self.skillDetailGroups(self.selectedSkills[i].skill_id)
        for (let j = 0; j < detailGroups.length; j++) {
          details = self.detailsByGroupId(detailGroups[j].id)
          for (let k = 0; k < details.length; k++) {
            self.detailsState.push({
              skill_detail_id: details[k].id,
              selected: self.isSelected('details', details[k].id)
            })
          }
        }
      }
    },
    prepEmployerSkillDetails: function () {
      this.$store.dispatch('expertHistory/getMyEmployerSkillDetails', {override: true})
    },
    prepIndustries: function () {
      this.industries = []
      for (let i = 0; i < this.$store.state.vars.expertise.industries.length; i++) {
        this.industries.push({
          industry_id: this.$store.state.vars.expertise.industries[i].id,
          title: this.$store.state.vars.expertise.industries[i].title,
          selected: this.$store.getters['expertIndustries/industrySelected'](this.$store.state.vars.expertise.industries[i].id)
        })
      }
    },
    industryState: function (index) {
      if (index < this.industries.length) {
        return this.industries[index].selected
      }
      return false
    },
    toggleIndustry: function (index) {
      if (!this.form_loading) {
        if (index < this.industries.length) {
          this.industries[index].selected = !this.industries[index].selected
        }
      }
    },
    handleNetworkError: function (error) {
      let self = this
      let status = (error && error.hasOwnProperty('response') && error.response && error.response.hasOwnProperty('status')) ? error.response.status : error.message
      switch (status) {
        case 401:
          // TODO: use alert
          self.$store.dispatch('auth/logout')
          self.$router.replace({name: 'home'})
          break
        case 'Network Error':
          // TODO: use alert
          console.log('alert')
          break
      }
    },
    setStep: function (newStep) {
      let self = this
      let currentStep = self.step
      // set newStep based on hasDetails
      if (newStep === 3 && !this.hasDetails) {
        newStep = 2
        if (currentStep === 2) {
          newStep = 4
        }
      }
      if (newStep === 4) {
        self.prepIndustries()
      }
      console.log('entering step set with', newStep, currentStep)
      // do any processing based on the change in step
      let stepWork = new Promise((resolve, reject) => {
        // choose action based on the current step
        switch (currentStep) {
          case 1:
            console.log('leaving 1')
            // we'll want to save the form
            self.form_loading = true
            this.saveForm1()
              .then(() => {
                // success, we can move on
                if (newStep === 2) {
                  console.log('preparing for step 2')
                  self.prepSkills()
                }
                resolve(newStep)
              })
              .catch((error) => {
                this.handleNetworkError(error)
                reject(error)
              })
              .finally(() => {
                self.form_loading = false
              })
            break
          case 2:
            // we'll want to save the form
            console.log('leaving step 2')
            self.form_loading = true

            this.saveForm2()
              .then(() => {
                // success, we can move on
                if (newStep === 3) {
                  self.prepDetails()
                }
                resolve(newStep)
              })
              .catch((error) => {
                this.handleNetworkError(error)
                reject(error)
              })
              .finally(() => {
                self.form_loading = false
              })
            break
          case 3:
            self.form_loading = true
            if (newStep === 2) {
              console.log('preparing for step 2')
              self.prepEmployerSkillDetails()
            }
            console.log('leaving step 3')
            console.log('preparing for step 4')
            // assuming we made any changes, we will need to update the history state
            self.saveForm3()
              .then(() => {
                resolve(newStep)
              })
              .catch((error) => {
                console.error(error)
                this.handleNetworkError(error)
                reject(error)
              })
              .finally(() => {
                self.form_loading = false
              })
            break
          case 4:
            // we'll want to save the form
            console.log('leaving step 4')
            self.form_loading = true
            this.saveForm4()
              .then(() => {
                // success, we can move on
                if (newStep === 5) {
                  console.log('preparing for step 5')
                }
                resolve(newStep)
              })
              .catch((error) => {
                this.handleNetworkError(error)
                reject(error)
              })
              .finally(() => {
                self.form_loading = false
              })
            break
          default:
            resolve(newStep)
            break
        }
      })
      // update path based on step
      stepWork
        .then((step) => {
          if (step === 5) {
            self.$emit('navigate', 'next')
            self.step = 1
          } else if (step === 0) {
            self.$emit('navigate', 'back')
            self.step = 1
          } else {
            self.step = step
            this.$ga.page({
              page: this.$route.path + '/2/' + this.step
            })
          }
        })
        .finally(() => {
          console.log('completing set step')
        })
    },
    saveForm1: function () {
      // 1. send selections to API
      let self = this
      let selectedCategoryIds = []

      return new Promise((resolve, reject) => {
        for (let i = 0; i < self.categories.length; i++) {
          if (self.categories[i].selected) {
            selectedCategoryIds.push(self.categories[i].id)
          }
        }
        self.$store.dispatch('expertSkills/replaceMyCategories', {categories: selectedCategoryIds})
          .then((result) => {
            // 2. make sure we have data for next step
            self.$store.dispatch('expertSkills/getMySkillDetails', {override: result})
            let promises = []
            promises.push(self.$store.dispatch('vars/initData'))
            promises.push(self.$store.dispatch('expertSkills/getMySkills', {override: result}))
            Promise.all(promises)
              .then(() => {
                // 3. go to next step
                resolve()
              })
              .catch((error) => {
                console.error(error)
                reject(error)
              })
          })
          .catch((error) => {
            console.error(error)
            reject(error)
          })
      })
    },
    saveForm2: function () {
      let self = this
      return new Promise((resolve, reject) => {
        // 1. send selections to API
        // save these gathered skills
        console.log('about to replace my skills')
        self.$store.dispatch('expertSkills/replaceMySkills', {skills: self.selectedSkills})
          .then((result) => {
            // 2. make sure we have data for next step
            let promises = []
            promises.push(self.$store.dispatch('vars/initData'))
            promises.push(self.$store.dispatch('expertSkills/getMySkillDetails', {override: result}))
            promises.push(self.$store.dispatch('expertHistory/getMyEmployerSkillDetails', {override: result}))

            Promise.all(promises)
              .then(() => {
                resolve()
              })
              .catch((error) => {
                console.error(error)
                reject(error)
              })
          })
          .catch((error) => {
            console.error(error)
            // TODO display error
            reject(error)
          })
      })
    },
    saveForm3: function () {
      let self = this
      return new Promise((resolve, reject) => {
        console.log('about to replace expert skill details')
        self.$store.dispatch('expertSkills/replaceMyDetails', {details: self.selectedDetails})
          .then((result) => {
            resolve()
          })
          .catch((error) => {
            reject(error)
          })
      })
    },
    saveForm4: function (step) {
      let self = this
      let selectedIndustryIds = []
      return new Promise((resolve, reject) => {
        // 1. send selections to API
        // save these gathered skill details
        for (let i = 0; i < self.industries.length; i++) {
          if (self.industries[i].selected) {
            selectedIndustryIds.push(self.industries[i].industry_id)
          }
        }
        console.log('about to replace my industries')
        self.$store.dispatch('expertIndustries/replaceMyIndustries', {industries: selectedIndustryIds})
          .then((result) => {
            // 2. make sure we have data for next step
            let promises = []
            promises.push(self.$store.dispatch('vars/initData'))

            Promise.all(promises)
              .then(() => {
                resolve()
              })
              .catch((error) => {
                console.error(error)
                reject(error)
              })
          })
          .catch((error) => {
            console.error(error)
            // TODO display error
            reject(error)
          })
      })
    }
  }
}
</script>

<style lang="stylus">
.card__text {
  text-align: left !important
}
.button-bar-flex {
  display: flex !important;
  .btn {
    flex-grow: 1 !important;
  }
}
h1 {
  line-height: 30px;
  margin-bottom: 9px;
}
</style>
