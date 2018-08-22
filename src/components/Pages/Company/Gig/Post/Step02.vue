<template>
  <v-card flat>
    <stepButtons @navigate="setStep" :formLoading="form_loading" :formValid="form_valid" :backButton="backButton" :forwardButton="forwardButton" :top="true" :title="pageTitle" />

    <p class="title hidden-sm-and-up" v-html="pageTitle"></p>

    <p class="headline">
      Select a skill category
    </p>

    <v-container fluid grid-list-md class="mb-3">
      <v-layout row wrap>
        <v-flex xs12 sm6 v-for="(category, index) in expertise.categories" :key="index" d-flex>
          <v-card class="ease-in-out" :color="categoryState(index) ? 'primary': ''" :dark="categoryState(index)" @click.native="toggleCategory(index)">
            <v-card-text>
              <h1>{{ category.title }}</h1>
              <p v-html="category.description"></p>
            </v-card-text>
          </v-card>
        </v-flex>
      </v-layout>
    </v-container>

    <stepButtons @navigate="setStep" :formLoading="form_loading" :formValid="form_valid" :backButton="backButton" :forwardButton="forwardButton" :top="false" :title="pageTitle" />
  </v-card>
</template>
<script>
import {mapState} from 'vuex'
import StepButtons from '@/components/Parts/StepButtons.vue'

export default {
  components: {
    stepButtons: StepButtons
  },
  props: ['gig'],
  data () {
    return {
      step: 2,
      form_loading: false,
      backButton: 'Back',
      forwardButton: 'Next',
      pageTitle: 'Pick a category',
      newCategories: []
    }
  },
  computed: {
    form_valid: function () {
      for (let i = 0; i < this.newCategories.length; i++) {
        if (this.newCategories[i].selected) {
          return true
        }
      }
      return false
    },
    ...mapState('vars', ['expertise'])
  },
  methods: {
    // TODO: move this to an event at Index and emit gig
    setStep: function (direction) {
      console.log(direction)

      let self = this
      let currentStep = self.step
      let newStep = (direction === 'back') ? currentStep - 1 : currentStep + 1
      console.log('entering step set with', newStep, currentStep)
      new Promise((resolve, reject) => {
        self.form_loading = true
        for (let i = 0; i < self.newCategories.length; i++) {
          if (self.newCategories[i].selected) {
            self.gig.skill_category_id = self.newCategories[i].category_id
          }
        }
        // we can do our update now that we know the category id
        self.$emit('prepare', newStep)
        self.form_loading = true
        let action = (self.gig.id) ? 'update' : 'add'
        self.$store.dispatch(`customerGigs/${action}Gig`, {gig: self.gig})
          .then(() => {
            // success, we can move on
            // emit call to prepare next step
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
          self.$emit('navigate', (step > self.step) ? 'next' : 'back')
        })
        .catch((error) => {
          console.error('error in setStep resolution', error)
          self.$emit('networkError', error)
        })
        .finally(() => {
          console.log('completing set step')
        })
    },
    toggleCategory: function (index) {
      let changeTo
      if (!this.form_loading) {
        if (index < this.newCategories.length) {
          changeTo = !this.newCategories[index].selected
          if (changeTo) { // we're only allowing one to be selected, so if this is true, the others must be false
            for (let i = 0; i < this.newCategories.length; i++) {
              this.newCategories[i].selected = false
            }
          }
          this.newCategories[index].selected = changeTo
        }
      }
    },
    categoryState: function (index) {
      if (index < this.newCategories.length) {
        return this.newCategories[index].selected
      }
      return false
    }
  },
  mounted () {
    let self = this
    let category
    self.newCategories = []
    for (let i = 0; i < self.expertise.categories.length; i++) {
      category = self.expertise.categories[i]
      self.newCategories.push({
        category_id: category.id,
        title: category.title,
        description: category.description,
        selected: category.id === self.gig.skill_category_id
      })
    }
  }
}
</script>
