<template>
  <v-card flat class="elevation-12">
    <v-toolbar dark color="primary">
      <v-toolbar-title class="headline white--text">{{ ($route.params && $route.params.gigId) ? 'Edit' : 'Post a' }} Gig</v-toolbar-title>
    </v-toolbar>
    <v-card v-if="step === 0">
      <v-card-title>
        Loading data
      </v-card-title>
      <v-progress-circular indeterminate :size="50" color="primary"></v-progress-circular>
    </v-card>
    <v-stepper v-if="step > 0 && gigForm" alt-labels value="1" v-model="step" class="elevation-0">
      <v-stepper-header>
        <v-stepper-step step="1" :complete="step > 1" :editable="step > 1">Category</v-stepper-step>
        <v-divider></v-divider>
        <v-stepper-step step="2" :complete="step > 2" :editable="step > 2">Skill</v-stepper-step>
        <v-divider></v-divider>
        <v-stepper-step step="3" :complete="step > 3" :editable="step > 3">Experience</v-stepper-step>
        <v-divider></v-divider>
        <v-stepper-step step="4" :complete="step > 4" :editable="step > 4">Description</v-stepper-step>
      </v-stepper-header>
      <v-stepper-items>
        <v-stepper-content step="1">
          <step-01 :gigForm="gigForm" @navigate="setStep" @prepare="prepare" @networkError="handleNetworkError"></step-01>
        </v-stepper-content>
        <v-stepper-content step="2">
          <step-02 :gigForm="gigForm" :skillsForm="skillsForm" @navigate="setStep" @prepare="prepare" @networkError="handleNetworkError"></step-02>
        </v-stepper-content>
        <v-stepper-content step="3">
          <step-03 :detailsForm="detailsForm" :details="details" @navigate="setStep" @prepare="prepare" @networkError="handleNetworkError"></step-03>
        </v-stepper-content>
        <v-stepper-content step="4">
          <step-04 :gigForm="gigForm" @navigate="setStep" @prepare="prepare" @networkError="handleNetworkError"></step-04>
        </v-stepper-content>
      </v-stepper-items>
    </v-stepper>
  </v-card>
</template>

<script>
import step01 from './FormCategories'
import step02 from './FormSkills'
import step03 from './FormExperience'
import step04 from './FormDescription'
export default {
  props: ['gigForm', 'reviewForm', 'skillsForm', 'detailsForm', 'details', 'home'],
  components: {
    step01,
    step02,
    step03,
    step04
  },
  data () {
    return {
      step: 1
    }
  },
  methods: {
    handleNetworkError: function (error) {
      let self = this
      let status = (error && error.hasOwnProperty('response') && error.response && error.response.hasOwnProperty('status')) ? error.response.status : error.message
      switch (status) {
        case 401:
          // TODO: use alert
          self.$store.dispatch('auth/logout')
          self.$router.replace({name: 'home'})
          return true
        case 'Network Error':
          // TODO: use alert
          console.log('alert', error)
          return false
      }
    },
    setStep: function (direction) {
      this.$emit('refresh', 'forms')
      if (isNaN(direction)) {
        if (direction === 'back') {
          // set newStep based on hasDetails
          if (parseInt(this.step) === 4 && !this.hasDetails) {
            this.step = 2
          } else if (parseInt(this.step) === 1) {
            // time to mosey on back to the main  page, cowboy!
            this.$emit('navigate', this.home)
          } else {
            this.step--
          }
        } else {
          // set newStep based on hasDetails
          if (parseInt(this.step) === 2 && !this.hasDetails) {
            this.step = 4
          } else if (parseInt(this.step) === 4) {
            // time to mosey on back to the main  page, cowboy!
            this.$emit('navigate', this.home)
          } else {
            this.step++
          }
        }
      } else {
        console.log(parseInt(direction))
        if (parseInt(direction) === 3 && !this.hasDetails) {
          this.step = (this.step === 2) ? 4 : 2 // choose next step based on previous step
        } else if (parseInt(direction) === 5 || parseInt(direction) === 0) {
          // time to mosey on back to the main  page, cowboy!
          this.$emit('navigate', this.home)
        } else {
          this.step = parseInt(direction)
        }
      }
    },
    prepare: function (step) {
      this.$emit('prepare', step)
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
.text--left {
  text-align: left;
}
</style>
