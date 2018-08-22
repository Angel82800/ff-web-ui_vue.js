<template>
  <v-card flat>
    <v-card-actions class="mb-3">
      <v-btn :loading="formLoading" :disabled="formLoading" @click="setStep(parseInt(step) - 1)" color="primary"><v-icon left dark class="hidden-xs-only">arrow_back</v-icon>{{ backButton }}</v-btn>
      <v-spacer></v-spacer>
      <p class="title hidden-xs-only">
        {{ pageTitle }}
      </p>
      <v-spacer class="hidden-xs-only"></v-spacer>
      <v-btn :loading="formLoading" :disabled="!formValid || formLoading" @click="setStep(parseInt(step) + 1)" color="primary">{{ forwardButton }}<v-icon right dark class="hidden-xs-only">arrow_forward</v-icon></v-btn>
    </v-card-actions>

    <p class="title hidden-sm-and-up">
      {{ pageTitle}}
    </p>

    <transition name="fade" mode="out-in">
      <div v-if="step === 1" key="1">
        <p class="headline">
          What is the expert's primary category of expertise?
        </p>
        <v-container fluid grid-list-md class="mb-3">
          <v-layout row wrap>
            <v-flex xs12 sm6 v-for="(category, index) in categoriesForm" :key="index" d-flex>
              <v-card class="ease-in-out" :color="categoryState(index) ? 'primary': ''" :dark="categoryState(index)" @click.native="toggleCategory(index)">
                <v-card-text>
                  <h1>{{ category.title }}</h1>
                  <p v-html="category.description"></p>
                </v-card-text>
              </v-card>
            </v-flex>
          </v-layout>
        </v-container>
      </div>
      <div v-if="step === 2" key="2">
        <p class="headline">
          Select the expert's years of experience in each skill
        </p>
        <div class="text-xs-left mb-5 mt-4">
          <div class="mb-5" v-for="(category, catIndex) in  categoriesById({categoryIds: selectedCategories})" :key="catIndex">
            <h1 class="grey--text text--darken-1">{{ category.title }}</h1>

            <div class="mt-2 mb-3" v-for="(skill, skillIndex) in categorySkills(category.id)" :key="skillIndex">
              <h2>{{ skill.title }}</h2>
              <v-btn-toggle v-model="skill.level" class="button-bar-flex button-bar-primary mt-2 mb-2">
                <v-btn v-for="(level, levelIndex) in expertise.skillLevels" :key="levelIndex" :disabled="formLoading" block :value="levelIndex">
                  <div v-html="expertise.skillLevels[levelIndex]"></div>
                </v-btn>
              </v-btn-toggle>
            </div>
          </div>
        </div>
      </div>
      <div v-if="step === 3" key="3">
        <p class="headline">
          Select the skill details that relate to the expert
        </p>
        <div class="text-xs-left mb-5 mt-4">
          <div class="mb-3" v-for="(category, catIndex) in detailsForm" :key="catIndex">
            <h1 class="grey--text text--darken-1">{{ category.title }}</h1>
            <div class="my-2" v-for="(skill, skillIndex) in category.skills" :key="skillIndex">
              <h2 v-html="skill.title"></h2>
              <div class="my-2" v-for="(group, groupIndex) in skill.groups" :key="groupIndex">
                <h3 v-html="group.title"></h3>
                <v-btn
                  v-for="(detail, detailIndex) in group.details"
                  :key="detailIndex"
                  outline
                  :disabled="form_loading"
                  :color="detailState(detail.id) ? 'primary': ''"
                  :dark="!form_loading && (detailState(detail.id) ? true : false)"
                  @click.native="toggleDetail(detail.id)"
                >
                  <span v-html="detail.title"></span>
                  <v-icon right dark v-html="detailState(detail.id) ? 'check_box' : 'check_box_outline_blank'">check</v-icon>
                </v-btn>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-if="step === 4" key="4">
        <p class="headline">
          Select the industries the expert has worked in {{ industriesForm.length }}
        </p>
        <v-btn outline :disabled="form_loading" v-for="(industry, index) in industriesForm" :key="industry.id" :color="industryState(index) ? 'primary': ''" :dark="!form_loading && (industryState(index) ? true : false)" @click.native="toggleIndustry(index)">
          <span v-html="industry.title"></span>
          <v-icon v-html="industryState(index) ? 'check_box' : 'check_box_outline_blank'" right dark>check</v-icon>
        </v-btn>
      </div>
    </transition>

    <v-card-actions class="mb-3">
      <v-btn :loading="formLoading" :disabled="formLoading" @click="setStep(parseInt(step) - 1)" color="primary"><v-icon left dark class="hidden-xs-only">arrow_back</v-icon>{{ backButton }}</v-btn>
      <v-spacer></v-spacer>
      <v-btn :loading="formLoading" :disabled="!formValid || formLoading" @click="setStep(parseInt(step) + 1)" color="primary">{{ forwardButton }}<v-icon right dark class="hidden-xs-only">arrow_forward</v-icon></v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
import {mapGetters, mapState} from 'vuex'

export default {
  props: ['userProfileId'],
  data () {
    return {
      formLoading: false,
      step: 1,
      categoriesForm: [],
      skillsForm: [],
      detailsForm: [],
      detailsState: [],
      industriesForm: []
    }
  },
  computed: {
    totalSteps: function () {
      return 4
    },
    forwardButton: function () {
      switch (this.step) {
        case 1:
          return 'Skills'
        case 2:
          // it's only 'details' if the selected skills have details
          if (this.hasDetails) {
            return 'Details'
          }
          return 'Industries'
        case 3:
          return 'Industries'
        default:
          return 'Review'
      }
    },
    backButton: function () {
      switch (this.step) {
        default:
          return 'Back'
      }
    },
    pageTitle: function () {
      return (this.step < 4) ? `Expertise (${this.step} of ${this.totalSteps})` : ''
    },
    formValid: function () {
      let self = this
      switch (this.step) {
        case 1:
          return self.selectedCategories.length > 0
        case 2:
          for (let i = 0; i < this.skillsForm.length; i++) {
            if (parseInt(this.skillsForm[i].level) > 0) {
              return true
            }
          }
          return false
        case 3:
          let groupIndex = -1
          // loop through cats and skills to get to groups. Look for at least one selected item in each group of details
          for (let i = 0; i < self.detailsForm.length; i++) {
            for (let j = 0; j < self.detailsForm[i].skills.length; j++) {
              for (let k = 0; k < self.detailsForm[i].skills[j].groups.length; k++) {
                groupIndex = self.detailsForm[i].skills[j].groups[k].details.findIndex((detail) => {
                  let selectedIndex = self.selectedDetails.findIndex((selectedId) => {
                    return selectedId === detail.id
                  })
                  return (selectedIndex > -1)
                })
                if (groupIndex < 0) {
                  return false
                }
              }
            }
          }
          return true
        case 4:
          return self.selectedIndustries.length > 0
      }
    },
    selectedCategories: function () {
      let selectedCategoryIds = []
      for (let i = 0; i < this.categoriesForm.length; i++) {
        if (this.categoriesForm[i].selected) {
          selectedCategoryIds.push(this.categoriesForm[i].category_id)
        }
      }
      return selectedCategoryIds
    },
    selectedSkills: function () {
      let self = this
      let selectedSkills = []
      // gather the skills that do not have a level of '0'
      for (let i = 0; i < self.skillsForm.length; i++) {
        if (parseInt(self.skillsForm[i].level) > 0) {
          selectedSkills.push({skill_id: self.skillsForm[i].skill_id, level: parseInt(self.skillsForm[i].level)}) // form turns it into a str. we're turning it back
        }
      }
      return selectedSkills
    },
    hasDetails: function () {
      // check for details on this.selectedSkills
      if (this.selectedSkills.length) {
        let skillIds = []
        for (let i = 0; i < this.selectedSkills.length; i++) {
          skillIds.push(this.selectedSkills[i].skill_id)
        }
        return this.skillsHaveDetails({skillIds})
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
    selectedIndustries: function () {
      let selectedIndustries = []
      this.industriesForm.forEach((industry) => {
        if (industry.selected) {
          selectedIndustries.push(industry.industry_id)
        }
      })
      return selectedIndustries
    },
    ...mapState('expertSkills', ['categories', 'skills']),
    ...mapState('vars', ['expertise']),
    ...mapGetters('expertSkills', ['isSelected', 'skillLevel']),
    ...mapGetters('expertIndustries', ['industrySelected']),
    ...mapGetters('vars', ['categoriesById', 'skillsByCategoryId', 'skillsHaveDetails', 'detailGroupsBySkillId', 'detailsByGroupId'])
  },
  methods: {
    setStep: function (newStep) {
      let self = this
      let currentStep = self.step
      // console.log('entering step set with', newStep, currentStep)
      new Promise((resolve, reject) => {
        let savePromise
        self.formLoading = true
        // console.log('leaving', currentStep)
        switch (true) {
          case (self.formValid && currentStep === 1):
            savePromise = this.saveForm1()
            break
          case (self.formValid && currentStep === 2):
            savePromise = this.saveForm2()
            break
          case (self.formValid && currentStep === 3):
            savePromise = this.saveForm3()
            break
          case (self.formValid && currentStep === 4):
            savePromise = this.saveForm4()
            break
          default:
            savePromise = new Promise((resolve, reject) => {
              resolve()
            })
            break
        }
        savePromise
          .then(() => {
            // success, we can move on
            if (newStep === currentStep + 1) {
              // prepare for next step
              switch (newStep) {
                case 2:
                  this.prepForm2()
                  break
                case 3:
                  this.prepForm3()
                  break
                case 4:
                  this.prepForm4()
                  break
                default:
                  // placeholder
                  break
              }
            }
            resolve(newStep)
          })
          .catch((error) => {
            console.log('error in setStep.stepWork')
            reject(error)
          })
          .finally(() => {
            self.formLoading = false
          })
      })
        .then((step) => {
          if (step === (this.totalSteps + 1) || (!this.hasDetails && step === this.totalSteps) || step === 0) {
            this.$emit('setView', 'review')
            self.step = 1
          } else {
            self.step = step
          }
        })
        .catch((error) => {
          console.error('error in setStep resolution', error)
          self.$emit('networkError', error)
        })
    },
    categoryState: function (index) {
      if (index < this.categoriesForm.length) {
        return this.categoriesForm[index].selected
      }
      return false
    },
    toggleCategory: function (index) {
      let changeTo
      if (!this.form_loading) {
        if (index < this.categoriesForm.length) {
          changeTo = !this.categoriesForm[index].selected
          if (changeTo) { // we're only allowing one to be selected, so if this is true, the others must be false
            for (let i = 0; i < this.categoriesForm.length; i++) {
              this.categoriesForm[i].selected = false
            }
          }
          this.categoriesForm[index].selected = changeTo
        }
      }
    },
    saveForm1: function () {
      let self = this
      return new Promise((resolve, reject) => {
        console.log('about to replace expert categories')
        self.$store.dispatch('expertSkills/replaceEditSkillCategories', {userProfileId: self.userProfileId, categories: self.selectedCategories})
          .then((result) => {
            resolve()
          })
          .catch((error) => {
            reject(error)
          })
      })
    },
    prepForm2: function () {
      let self = this
      self.skillsForm = []
      self.selectedCategories.forEach((categoryId) => {
        self.skillsByCategoryId({categoryId}).forEach((skill) => {
          self.skillsForm.push({
            skill_id: skill.id,
            skill_category_id: skill.skill_category_id,
            title: skill.title,
            level: this.skillLevel(skill.id) // .toString()
          })
        })
      })
    },
    categorySkills: function (categoryId) {
      return this.skillsForm.filter((skill) => {
        return skill.skill_category_id === categoryId
      })
    },
    saveForm2: function () {
      let self = this
      return new Promise((resolve, reject) => {
        console.log('about to replace expert skills')
        self.$store.dispatch('expertSkills/replaceEditSkills', {userProfileId: self.userProfileId, skills: self.selectedSkills})
          .then((result) => {
            resolve()
          })
          .catch((error) => {
            reject(error)
          })
      })
    },
    prepForm3: function () {
      let self = this
      let catIdx = 0
      let skillIdx = 0
      let groupIdx = 0
      self.detailsForm = []
      self.detailsState = []
      self.categoriesById({categoryIds: self.selectedCategories}).forEach((category) => {
        // add in the skills, if available
        self.categorySkills(category.id).forEach((skill) => {
          if (self.isSelected('skills', skill.skill_id) && self.skillsHaveDetails({skillIds: [skill.skill_id]})) { // the skill has to be selected and have details
            // we wait until now to add in the category since we don't want it to be empty
            if (self.detailsForm.length === catIdx) { // these are the same if we have not yet added in this category
              self.detailsForm.push({
                id: category.id,
                title: category.title,
                skills: []
              })
            }
            self.detailsForm[catIdx].skills.push({
              id: skill.skill_id,
              title: skill.title,
              groups: []
            })
            // add in the detail groups
            self.detailGroupsBySkillId({skillId: skill.skill_id}).forEach((group) => {
              self.detailsForm[catIdx].skills[skillIdx].groups.push({
                id: group.id,
                title: group.title,
                details: []
              })
              // add in the detail selections
              self.detailsByGroupId(group.id).forEach((detail) => {
                self.detailsForm[catIdx].skills[skillIdx].groups[groupIdx].details.push({
                  id: detail.id,
                  title: detail.title
                })
                self.detailsState.push({
                  skill_detail_id: detail.id,
                  selected: self.isSelected('details', detail.id)
                })
              })
              groupIdx++
            })
            skillIdx++
            groupIdx = 0
          }
        })
        catIdx = self.detailsForm.length // track what cat index we are on
        skillIdx = 0
      })
    },
    detailState: function (detailId) {
      let index = this.detailsState.findIndex(detail => {
        return detail.skill_detail_id === detailId
      })
      return this.detailsState[index].selected
    },
    toggleDetail: function (detailId) {
      if (!this.form_loading) {
        let index = this.detailsState.findIndex(detail => {
          return detail.skill_detail_id === detailId
        })
        this.detailsState[index].selected = !this.detailsState[index].selected
      }
    },
    saveForm3: function () {
      let self = this
      return new Promise((resolve, reject) => {
        console.log('about to replace expert skill details')
        self.$store.dispatch('expertSkills/replaceEditDetails', {userProfileId: self.userProfileId, details: self.selectedDetails})
          .then((result) => {
            resolve()
          })
          .catch((error) => {
            reject(error)
          })
      })
    },
    prepForm4: function () {
      let self = this
      self.industriesForm = []
      self.expertise.industries.forEach((industry) => {
        self.industriesForm.push({
          industry_id: industry.id,
          title: industry.title,
          selected: self.industrySelected(industry.id)
        })
      })
    },
    industryState: function (index) {
      if (index < this.industriesForm.length) {
        return this.industriesForm[index].selected
      }
      return false
    },
    toggleIndustry: function (index) {
      if (!this.formLoading) {
        if (index < this.industriesForm.length) {
          this.industriesForm[index].selected = !this.industriesForm[index].selected
        }
      }
    },
    saveForm4: function () {
      let self = this
      return new Promise((resolve, reject) => {
        console.log('about to replace my industries')
        self.$store.dispatch('expertIndustries/replaceEditIndustries', {userProfileId: self.userProfileId, industries: self.selectedIndustries})
          .then((result) => {
            resolve()
          })
          .catch((error) => {
            reject(error)
          })
      })
    },
    remount: function () {
      let self = this
      self.form_loading = true
      let promises = []
      promises.push(self.$store.dispatch('vars/initData'))
      promises.push(self.$store.dispatch('expertSkills/initEditData', {userProfileId: self.userProfileId}))

      Promise.all(promises)
        .then((result) => {
          let category
          self.categoriesForm = []
          for (let i = 0; i < self.expertise.categories.length; i++) {
            category = self.expertise.categories[i]
            self.categoriesForm.push({
              category_id: category.id,
              title: category.title,
              description: category.description,
              selected: self.isSelected('categories', category.id)
            })
          }
        })
        .catch((error) => {
          console.error(error)
        })
        .finally(() => {
          self.form_loading = false
        })
    }
  },
  mounted () {
    // make sure we have the data for this step
    this.remount()
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
</style>
