<template>
  <v-card flat>
    <v-card-actions class="mb-3">
      <v-btn v-if="step > 1" :loading="form_loading" :disabled="form_loading" @click="setStep(parseInt(step) - 1)" color="primary"><v-icon left dark class="hidden-xs-only">arrow_back</v-icon>{{ backButton }}</v-btn>
      <v-spacer v-if="step === 1"></v-spacer>
      <v-spacer></v-spacer>
      <p class="title hidden-xs-only">
        {{ pageTitle }}
      </p>
      <v-spacer class="hidden-xs-only"></v-spacer>
      <v-btn :loading="form_loading" :disabled="!form_valid || form_loading" @click="setStep(parseInt(step) + 1)" color="primary">{{ forwardButton }}<v-icon right dark class="hidden-xs-only">arrow_forward</v-icon></v-btn>
    </v-card-actions>

    <p class="title hidden-sm-and-up">
      {{ pageTitle }}
    </p>

    <transition name="fade" mode="out-in">
      <div v-if="step === 1" key="1">
        <p class="headline">
          What kinds of positions to you anticipate hiring for in the next 12 months?
        </p>
        <v-container fluid grid-list-md class="mb-3">
          <v-layout row wrap>
            <template v-if="newCategories.length">
              <v-flex xs12 sm6 v-for="(category, index) in newCategories" :key="index" d-flex>
                <v-card class="ease-in-out" :color="categoryState(index) ? 'primary': ''" :dark="categoryState(index)" @click.native="toggleCategory(index)">
                  <v-card-text>
                    <h1>{{ category.title }}</h1>
                    <p v-html="category.description"></p>
                  </v-card-text>
                </v-card>
              </v-flex>
            </template>
            <v-btn v-else @click.native="remount()">Category data missing. Click to retry</v-btn>
          </v-layout>
        </v-container>
      </div>
      <div v-if="step === 2" key="2">
        <p class="headline">
          What skills do you need in each category?
        </p>
        <div class="text-xs-left mb-5 mt-4">
          <div class="mb-5" v-for="(category, catIndex) in  categoriesById({categoryIds: selectedCategories})" :key="catIndex">
            <h1 class="grey--text text--darken-1">{{ category.title }}</h1>
            <v-btn outline :disabled="form_loading" v-for="(skill, skillIndex) in categorySkills(category.id)" :key="skillIndex" :color="skillState(skill.skill_id) ? 'primary': ''" :dark="!form_loading && (skillState(skill.skill_id) ? true : false)" @click.native="toggleSkill(skill.skill_id)">
              <span v-html="skill.title"></span>
              <v-icon v-html="skillState(skill.skill_id) ? 'check_box' : 'check_box_outline_blank'" right dark>check</v-icon>
            </v-btn>
          </div>
        </div>
      </div>
      <div v-if="step === 3" key="3">
        <p class="headline">
          What related knowledge do you need for each skill?
        </p>
        <div class="text-xs-left mb-5 mt-4">
          <div class="mb-3" v-for="(category, catIndex) in detailForm" :key="catIndex">
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
    </transition>
    <v-card-actions class="mb-3">
      <v-btn v-if="step > 1" :loading="form_loading" :disabled="form_loading" @click="setStep(parseInt(step) - 1)" color="primary"><v-icon left dark class="hidden-xs-only">arrow_back</v-icon>{{ backButton }}</v-btn>
      <v-spacer></v-spacer>
      <v-btn :loading="form_loading" :disabled="!form_valid || form_loading" @click="setStep(parseInt(step) + 1)" color="primary">{{ forwardButton }}<v-icon right dark class="hidden-xs-only">arrow_forward</v-icon></v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
import {mapState, mapGetters} from 'vuex'

export default {
  data () {
    return {
      step: 1,
      form_loading: false,
      newCategories: [],
      newSkills: [],
      detailForm: [],
      newDetails: []
    }
  },
  props: [],
  computed: {
    totalSteps: function () {
      return 3
    },
    forwardButton: function () {
      switch (this.step) {
        case 1:
          return this.selectedCategories.length ? 'Skills' : 'Skip section'
        case 2:
          // it's only 'details' if the selected skills have details
          if (this.hasDetails) {
            return 'Details'
          }
          return 'Review'
        case 3:
          return 'Review'
        default:
          return 'Forward'
      }
    },
    backButton: function () {
      switch (this.step) {
        default:
          return 'Back'
      }
    },
    pageTitle: function () {
      return (this.step < 5) ? `Workplace requirements (${this.step} of ${this.totalSteps})` : ''
    },
    form_valid: function () {
      let self = this
      switch (this.step) {
        case 1:
          return true // (this.selectedCategories.length > 0)
        case 2:
          let cats = this.selectedCategories
          let skills = this.selectedSkills
          let catSkills
          let count = 0
          for (let i = 0; i < cats.length; i++) {
            for (let j = 0; j < skills.length; j++) {
              catSkills = this.skillsByCategoryId({categoryId: cats[i]})
              for (let k = 0; k < catSkills.length; k++) {
                if (skills[j].skill_id === catSkills[k].id) {
                  count++
                  k = catSkills.length
                  j = skills.length
                }
              }
            }
            if (count === i) {
              // we didn't find a match
              return false
            }
          }
          return (count === cats.length)
        case 3:
          let groupIndex = -1
          // loop through cats and skills to get to groups. Look for at least one selected item in each group of details
          for (let i = 0; i < self.detailForm.length; i++) {
            for (let j = 0; j < self.detailForm[i].skills.length; j++) {
              for (let k = 0; k < self.detailForm[i].skills[j].groups.length; k++) {
                groupIndex = self.detailForm[i].skills[j].groups[k].details.findIndex((detail) => {
                  let selectedIndex = self.selectedDetails.findIndex((selectedId) => {
                    return selectedId.skill_detail_id === detail.id
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
        default:
          return true
      }
    },
    selectedCategories: function () {
      let selectedCategoryIds = []
      for (let i = 0; i < this.newCategories.length; i++) {
        if (this.newCategories[i].selected) {
          selectedCategoryIds.push(this.newCategories[i].category_id)
        }
      }
      return selectedCategoryIds
    },
    selectedSkills: function () {
      let selectedSkillIds = []
      for (let i = 0; i < this.newSkills.length; i++) {
        if (this.newSkills[i].selected) {
          selectedSkillIds.push({skill_id: this.newSkills[i].skill_id})
        }
      }
      return selectedSkillIds
    },
    selectedDetails: function () {
      let selectedDetailIds = []
      for (let i = 0; i < this.newDetails.length; i++) {
        if (this.newDetails[i].selected) {
          selectedDetailIds.push({skill_detail_id: this.newDetails[i].skill_detail_id})
        }
      }
      return selectedDetailIds
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
    ...mapState('customerSkills', ['categories', 'skills']),
    ...mapState('vars', ['expertise']),
    ...mapGetters('customerSkills', ['isSelected', 'dataCompare']),
    ...mapGetters('vars', ['categoriesById', 'skillsByCategoryId', 'skillsHaveDetails', 'detailGroupsBySkillId', 'detailsByGroupId'])
  },
  methods: {
    setStep: function (newStep) {
      let self = this
      let currentStep = self.step
      // console.log('entering step set with', newStep, currentStep)
      new Promise((resolve, reject) => {
        let savePromise
        self.form_loading = true
        // console.log('leaving', currentStep)
        switch (currentStep) {
          case 1:
            if (self.selectedCategories.length > 0) {
              savePromise = this.saveForm1()
            } else {
              newStep = self.totalSteps + 1
              savePromise = new Promise((resolve, reject) => {
                resolve()
              })
            }
            break
          case 2:
            savePromise = this.saveForm2()
            break
          case 3:
            savePromise = this.saveForm3()
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
            self.form_loading = false
          })
      })
        .then((step) => {
          if (step === (this.totalSteps + 1) || (!this.hasDetails && step === this.totalSteps)) {
            self.$emit('navigate', 'next')
            self.step = 1
          } else if (step === 0) {
            self.$emit('navigate', 'back')
            self.step = 1
          } else {
            self.step = step
          }
        })
        .catch((error) => {
          console.error('error in setStep resolution', error)
          self.$emit('networkError', error)
        })
        // .finally(() => {
        //   console.log('completing set step')
        // })
    },
    categoryState: function (index) {
      if (index < this.newCategories.length) {
        return this.newCategories[index].selected
      }
      return false
    },
    toggleCategory: function (index) {
      if (!this.form_loading) {
        if (index < this.newCategories.length) {
          this.newCategories[index].selected = !this.newCategories[index].selected
        }
      }
    },
    saveForm1: function () {
      let self = this
      return new Promise((resolve, reject) => {
        console.log('about to replace my categories')
        self.$store.dispatch('customerSkills/replaceMyCategories', {categories: self.selectedCategories})
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
      self.newSkills = []
      self.selectedCategories.forEach((categoryId) => {
        self.skillsByCategoryId({categoryId}).forEach((skill) => {
          self.newSkills.push({
            skill_id: skill.id,
            skill_category_id: skill.skill_category_id,
            title: skill.title,
            selected: self.isSelected('skills', skill.id)
          })
        })
      })
    },
    categorySkills: function (categoryId) {
      return this.newSkills.filter(skill => {
        return skill.skill_category_id === categoryId
      })
    },
    skillState: function (skillId) {
      let index = this.newSkills.findIndex(skill => {
        return skill.skill_id === skillId
      })
      return this.newSkills[index].selected
    },
    toggleSkill: function (skillId) {
      if (!this.form_loading) {
        let index = this.newSkills.findIndex(skill => {
          return skill.skill_id === skillId
        })
        this.newSkills[index].selected = !this.newSkills[index].selected
      }
    },
    saveForm2: function () {
      let self = this
      return new Promise((resolve, reject) => {
        self.$store.dispatch('customerSkills/replaceMySkills', {skills: self.selectedSkills})
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
      self.detailForm = []
      self.newDetails = []
      self.categoriesById({categoryIds: self.selectedCategories}).forEach((category) => {
        // add in the skills, if available
        self.categorySkills(category.id).forEach((skill) => {
          if (self.isSelected('skills', skill.skill_id) && self.skillsHaveDetails({skillIds: [skill.skill_id]})) { // the skill has to be selected and have details
            // we wait until now to add in the category since we don't want it to be empty
            if (self.detailForm.length === catIdx) { // these are the same if we have not yet added in this category
              self.detailForm.push({
                id: category.id,
                title: category.title,
                skills: []
              })
            }
            self.detailForm[catIdx].skills.push({
              id: skill.skill_id,
              title: skill.title,
              groups: []
            })
            // add in the detail groups
            self.detailGroupsBySkillId({skillId: skill.skill_id}).forEach((group) => {
              self.detailForm[catIdx].skills[skillIdx].groups.push({
                id: group.id,
                title: group.title,
                details: []
              })
              // add in the detail selections
              self.detailsByGroupId(group.id).forEach((detail) => {
                self.detailForm[catIdx].skills[skillIdx].groups[groupIdx].details.push({
                  id: detail.id,
                  title: detail.title
                })
                self.newDetails.push({
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
        catIdx = self.detailForm.length // track what cat index we are on
        skillIdx = 0
      })
    },
    detailState: function (detailId) {
      let index = this.newDetails.findIndex(detail => {
        return detail.skill_detail_id === detailId
      })
      return this.newDetails[index].selected
    },
    toggleDetail: function (detailId) {
      if (!this.form_loading) {
        let index = this.newDetails.findIndex(detail => {
          return detail.skill_detail_id === detailId
        })
        this.newDetails[index].selected = !this.newDetails[index].selected
      }
    },
    saveForm3: function () {
      let self = this
      return new Promise((resolve, reject) => {
        console.log('about to replace my skill details')
        self.$store.dispatch('customerSkills/replaceMyDetails', {details: self.selectedDetails})
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
      promises.push(self.$store.dispatch('customerSkills/initMyData'))

      Promise.all(promises)
        .then((result) => {
          let category
          self.newCategories = []
          for (let i = 0; i < self.expertise.categories.length; i++) {
            category = self.expertise.categories[i]
            self.newCategories.push({
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
