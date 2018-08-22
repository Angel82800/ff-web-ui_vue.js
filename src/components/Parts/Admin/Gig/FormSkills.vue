<template>
  <v-card flat>
    <stepButtons @navigate="setStep" :formLoading="formLoading" :formValid="formValid" :backButton="backButton" :forwardButton="forwardButton" :top="true" :title="pageTitle" />

    <p class="title hidden-sm-and-up" v-html="pageTitle"></p>

    <p class="headline">
      Choose the skills and experience levels you need for this job
    </p>

    <v-container fluid grid-list-xl class="pt-0 mb-5">
      <div class="text-xs-left">
        <div class="mb-5" v-if="gigForm.skill_category_id">
          <h1 class="grey--text text--darken-1">{{ categoriesById({categoryIds: [gigForm.skill_category_id]})[0].title }} </h1>
          <div class="mt-2 mb-3" v-for="(skill, skillIndex) in categorySkills(gigForm.skill_category_id)" :key="skillIndex">
            <h2>{{ skill.title }}</h2>
            <v-btn-toggle class="button-bar-flex button-bar-primary mt-2 mb-2" v-model="skill.level">
              <v-btn v-for="(level, levelIndex) in expertise.skillLevels" :key="levelIndex" :disabled="formLoading" block :value="levelIndex">
                <div v-html="expertise.skillLevels[levelIndex]"></div>
              </v-btn>
            </v-btn-toggle>
          </div>
        </div>
      </div>
    </v-container>

    <stepButtons @navigate="setStep" :formLoading="formLoading" :formValid="formValid" :backButton="backButton" :forwardButton="forwardButton" :top="false" :title="pageTitle" />
  </v-card>
</template>

<script>
import {mapState, mapGetters} from 'vuex'
import StepButtons from '../../StepButtons.vue'

export default {
  props: ['gigForm', 'skillsForm'],
  components: {
    stepButtons: StepButtons
  },
  data () {
    return {
      step: 2,
      formLoading: false,
      backButton: 'Back',
      forwardButton: 'Next',
      pageTitle: 'What skill do you need?'
    }
  },
  computed: {
    formValid: function () {
      if (this.skillsForm) {
        for (let i = 0; i < this.skillsForm.length; i++) {
          if (parseInt(this.skillsForm[i].level) > 0) {
            return true
          }
        }
      }
      return false
    },
    ...mapState('vars', ['expertise']),
    ...mapGetters('vars', ['categoriesById'])
  },
  methods: {
    setStep: function (direction) {
      let self = this
      let currentStep = self.step
      let newStep = (direction === 'back') ? currentStep - 1 : currentStep + 1
      new Promise((resolve, reject) => {
        self.formLoading = true
        let gigSkills = []
        for (let i = 0; i < self.skillsForm.length; i++) {
          if (parseInt(self.skillsForm[i].level) > 0) {
            gigSkills.push({
              skill_id: self.skillsForm[i].skill_id,
              level: self.skillsForm[i].level
            })
          }
        }
        self.$store.dispatch(`adminGigs/updateGigSkills`, {gigSkills})
          .then(() => {
            // success, we can move on
            // emit call to prepare next step
            self.$emit('prepare', newStep)
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
    categorySkills: function (categoryId) {
      return this.skillsForm.filter(skill => {
        return skill.skill_category_id === categoryId
      })
    }
  }
}
</script>
