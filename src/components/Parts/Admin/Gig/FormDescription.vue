<template>
  <v-card flat>
    <stepButtons @navigate="setStep" :formLoading="formLoading" :formValid="formValid" :backButton="backButton" :forwardButton="forwardButton" :top="true" :title="pageTitle" />

    <p class="title hidden-sm-and-up" v-html="pageTitle"></p>

    <p class="headline">
      Add any additional details you'd like the applicant to know
    </p>

    <v-container fluid grid-list-xl class="pt-0 mb-5 text--left">
      <v-layout justify-center row wrap>
        <v-flex xs12 md10 lg6>
          <v-card flat>
            <v-form>
              <v-text-field label="Any additional details you would like the applicant to be aware of?" textarea v-model="gigForm.description"></v-text-field>
            </v-form>
          </v-card>
        </v-flex>
      </v-layout>
    </v-container>
    <stepButtons @navigate="setStep" :formLoading="formLoading" :formValid="formValid" :backButton="backButton" :forwardButton="forwardButton" :top="false" :title="pageTitle" />
  </v-card>
</template>

<script>
import stepButtons from '@/components/Parts/StepButtons.vue'

export default {
  components: {
    stepButtons
  },
  props: ['gigForm'],
  data () {
    return {
      step: 5,
      formLoading: false,
      backButton: 'Back',
      forwardButton: 'Review',
      pageTitle: 'Gig description'
    }
  },
  computed: {
    formValid: function () {
      return true
    }
  },
  methods: {
    setStep: function (direction) {
      let self = this
      let currentStep = self.step
      let newStep = (direction === 'back') ? currentStep - 1 : currentStep + 1
      new Promise((resolve, reject) => {
        self.formLoading = true
        self.$store.dispatch(`adminGigs/updateGig`, {gig: self.gigForm})
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
    }
  }
}
</script>
