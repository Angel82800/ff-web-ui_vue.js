<template>
  <v-container fluid fill-height>
    <v-layout align-center justify-center>
      <v-flex xs12 lg9>
        <v-card flat class="elevation-12">
          <v-toolbar dark color="primary">
            <v-toolbar-title class="headline white--text">Edit your profile</v-toolbar-title>
            <!--
            <v-spacer></v-spacer>
            <v-toolbar-title id="onboardingProfilePoints">
              <v-chip class="primary lighten-4 px-2">Profile points:&nbsp;<span class="red--text text--darken-2">{{ profilePoints }}/100</span></v-chip>
            </v-toolbar-title>
             -->
          </v-toolbar>
          <v-card v-if="step === 0">
            <v-card-title>
              Loading data
            </v-card-title>
            <v-progress-circular indeterminate :size="50" color="primary"></v-progress-circular>
          </v-card>
          <v-stepper v-if="step > 0" alt-labels value="1" v-model="step" class="elevation-0">
            <v-stepper-header>
              <v-stepper-step step="1" :complete="step > 1" :editable="step > 1">Basic info</v-stepper-step>
              <v-divider></v-divider>
              <v-stepper-step step="2" :complete="step > 2" :editable="step > 2">Positions</v-stepper-step>
              <v-divider></v-divider>
              <v-stepper-step step="3">Review</v-stepper-step>
            </v-stepper-header>
            <v-stepper-items>
              <v-stepper-content step="1">
                <step-01 :customer="customerData" :profile="profileData" @navigate="setStep" @networkError="handleNetworkError"></step-01>
              </v-stepper-content>
              <v-stepper-content step="2">
                <step-02 @navigate="setStep" @networkError="handleNetworkError"></step-02>
              </v-stepper-content>
              <v-stepper-content step="3">
                <step-03 :customer="customerData" @navigate="setStep"></step-03>
              </v-stepper-content>
            </v-stepper-items>
          </v-stepper>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import Step01 from './Step01.vue'
import Step02 from './Step02.vue'
import Step03 from './Step03.vue'

export default {
  components: {
    step01: Step01,
    step02: Step02,
    step03: Step03
  },
  data () {
    return {
      step: 0,
      profileData: {},
      customerData: {},
      profilePoints: 0
    }
  },
  computed: {
    customer: function () {
      return this.$store.state.customer.mine
    },
    profile: function () {
      return this.$store.state.userProfile.mine
    }
  },
  methods: {
    refresh: function (which) {
      switch (true) {
        case which.indexOf('profile') > -1:
          this.profileData = Object.assign({}, this.$store.state.userProfile.mine)
          // falls through
        case which.indexOf('customer') > -1:
          this.customerData = Object.assign({}, this.$store.state.customer.mine)
          // falls through
      }
    },
    setStep: function (direction) {
      if (isNaN(direction)) {
        if (direction === 'back') {
          this.step--
        } else {
          if (this.step === 3) {
            // time to mosey on back to the main expert page, cowboy!
            this.$router.push({name: 'company'})
          } else {
            this.step++
          }
        }
      } else {
        this.step = parseInt(direction)
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
    }
  },
  mounted () {
    // TODO: update step based on path
    // TODO: initialize profile points
    let self = this
    let promises = []

    self.step = 0

    promises.push(self.$store.dispatch('vars/initData'))
    // promises.push(self.$store.dispatch('customerSkills/initMyData'))

    Promise.all(promises)
      .then(() => {
        self.profileData = Object.assign({}, self.$store.state.userProfile.mine)
        self.customerData = Object.assign({}, self.$store.state.customer.mine)
      })
      .catch((error) => {
        console.error(error)
      })
      .finally(() => {
        self.step = 1
      })
  },
  watch: {
    customer: function (newCustomer, oldCustomer) {
      this.refresh('customer')
    },
    profile: function (newProfile, oldProfile) {
      this.refresh('profile')
    }
  }
}
</script>
