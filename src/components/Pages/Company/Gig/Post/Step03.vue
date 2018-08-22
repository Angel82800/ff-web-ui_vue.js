<template>
  <v-card flat>
    <stepButtons @navigate="setStep" :formLoading="form_loading" :formValid="form_valid" :backButton="backButton" :forwardButton="forwardButton" :top="true" :title="pageTitle" />

    <p class="title hidden-sm-and-up" v-html="pageTitle"></p>

    <p class="headline">
      Choose the skills and experience levels you need for this job
    </p>

    <v-container fluid grid-list-xl class="pt-0 mb-5">
      <div class="text-xs-left">
        <div class="mb-5" v-if="gig.skill_category_id">
          <h1 class="grey--text text--darken-1">{{ categoriesById({categoryIds: [gig.skill_category_id]})[0].title }} </h1>
          <div class="mt-2 mb-3" v-for="(skill, skillIndex) in categorySkills(gig.skill_category_id)" :key="skillIndex">
            <h2>{{ skill.title }}</h2>
            <v-btn-toggle class="button-bar-flex button-bar-primary mt-2 mb-2" v-model="skill.level">
              <v-btn v-for="(level, levelIndex) in expertise.skillLevels" :key="levelIndex" :disabled="form_loading" block :value="levelIndex">
                <div v-html="expertise.skillLevels[levelIndex]"></div>
              </v-btn>
            </v-btn-toggle>
          </div>
        </div>
      </div>
    </v-container>

    <stepButtons @navigate="setStep" :formLoading="form_loading" :formValid="form_valid" :backButton="backButton" :forwardButton="forwardButton" :top="false" :title="pageTitle" />
  </v-card>
</template>

<script>
import {mapState, mapGetters} from 'vuex'
import StepButtons from '@/components/Parts/StepButtons.vue'

export default {
  components: {
    stepButtons: StepButtons
  },
  props: ['gig', 'newSkills'],
  data () {
    return {
      step: 3,
      form_loading: false,
      backButton: 'Back',
      forwardButton: 'Next',
      pageTitle: 'What skill do you need?'
    }
  },
  computed: {
    form_valid: function () {
      if (this.newSkills) {
        for (let i = 0; i < this.newSkills.length; i++) {
          if (parseInt(this.newSkills[i].level) > 0) {
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
    // TODO: move this to an event at Index and emit gig
    setStep: function (direction) {
      console.log(direction)
      let self = this
      let currentStep = self.step
      let newStep = (direction === 'back') ? currentStep - 1 : currentStep + 1
      console.log('entering step set with', newStep, currentStep)
      new Promise((resolve, reject) => {
        self.form_loading = true
        let gigSkills = []
        for (let i = 0; i < self.newSkills.length; i++) {
          if (parseInt(self.newSkills[i].level) > 0) {
            gigSkills.push({
              skill_id: self.newSkills[i].skill_id,
              level: self.newSkills[i].level
            })
          }
        }
        self.$store.dispatch(`customerGigs/updateGigSkills`, {gigSkills})
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
    categorySkills: function (categoryId) {
      return this.newSkills.filter(skill => {
        return skill.skill_category_id === categoryId
      })
    }
  },
  mounted () {

  }
}
</script>
