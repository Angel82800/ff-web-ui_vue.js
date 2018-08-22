<template>
  <v-container fluid fill-height>
    <v-layout align-center justify-center>
      <v-flex xs12 lg9>
        <v-card flat class="elevation-12">
          <v-toolbar dark color="primary">
            <v-toolbar-title class="headline white--text">Build your profile</v-toolbar-title>
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
              <!-- TODO: make the complete decision smarter so one can click back and forth more easily -->
              <v-stepper-step step="1" :editable="true">Basic info</v-stepper-step>
              <v-divider></v-divider>
              <v-stepper-step step="2" :editable="true">Expertise</v-stepper-step>
              <v-divider></v-divider>
              <v-stepper-step step="3" :editable="true">History</v-stepper-step>
              <v-divider></v-divider>
              <!-- <v-stepper-step step="4" :complete="step > 4" :editable="step > 4">Availability</v-stepper-step>
              <v-divider></v-divider> -->
              <v-stepper-step step="4" :editable="true">Review</v-stepper-step>
            </v-stepper-header>
            <v-stepper-items>
              <!-- step: welcome -->
              <v-stepper-content step="1">
                <onboarding-step01 :expert="expertData" :profile="profileData" @refresh="refresh" @navigate="setStep"></onboarding-step01>
              </v-stepper-content>
              <!-- step 2 -->
              <v-stepper-content step="2">
                <onboarding-step02 @navigate="setStep"></onboarding-step02>
              </v-stepper-content>
              <!-- step 3 -->
              <v-stepper-content step="3">
                <onboarding-step03 @navigate="setStep"></onboarding-step03>
              </v-stepper-content>
              <!-- step 4 -->
              <!-- <v-stepper-content step="4">
                <onboarding-step04 :expert="expertData" @refresh="refresh" @navigate="setStep"></onboarding-step04>
              </v-stepper-content> -->
              <!-- step 4 -->
              <v-stepper-content step="4">
                <onboarding-step05 :expert="expertData" :profile="profileData" @navigate="setStep"></onboarding-step05>
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
// import Step04 from './Step04.vue'
import Step05 from './Step05.vue'
export default {
  components: {
    onboardingStep01: Step01,
    onboardingStep02: Step02,
    onboardingStep03: Step03,
    // onboardingStep04: Step04,
    onboardingStep05: Step05
  },
  data () {
    return {
      step: 0,
      profileData: {},
      expertData: {},
      profilePoints: 0
    }
  },
  computed: {
    expert: function () {
      return this.$store.state.expert.mine
    },
    profile: function () {
      return this.$store.state.userProfile.mine
    }
  },
  methods: {
    refresh: function (which) {
      console.log('refresh called with', which)
      switch (true) {
        case which.indexOf('profile') > -1:
          this.profileData = Object.assign({}, this.$store.state.userProfile.mine)
          // falls through
        case which.indexOf('expert') > -1:
          this.expertData = Object.assign({}, this.$store.state.expert.mine)
          // falls through
      }
    },
    setStep: function (direction) {
      if (isNaN(direction)) {
        if (direction === 'back') {
          if (this.step === 1) {
            // time to mosey on back to the main expert page, cowboy!
            this.$router.push({name: 'expert'})
          } else {
            this.step--
          }
        } else {
          if (this.step === 4) {
            // time to mosey on back to the main expert page, cowboy!
            this.$router.push({name: 'expert'})
          } else {
            this.step++
          }
        }
      } else {
        this.step = parseInt(direction)
      }

      this.$ga.page({
        page: this.$route.path + '/' + this.step
      })
    }
  },
  mounted () {
    // TODO: update step based on path
    // TODO: initialize profile points
    let self = this
    let promises = []
    self.step = 0

    promises.push(self.$store.dispatch('vars/initData'))
    promises.push(self.$store.dispatch('expertSkills/initMyData'))

    Promise.all(promises)
      .then(() => {
        self.profileData = Object.assign({}, self.$store.state.userProfile.mine)
        self.expertData = Object.assign({}, self.$store.state.expert.mine)
      })
      .catch((error) => {
        console.error(error)
      })
      .finally(() => {
        if (self.$route.params.step > 0) {
          self.step = parseInt(self.$route.params.step)
        } else {
          self.step = 1
        }
      })
  },
  watch: {
    expert: function (newExpert, oldExpert) {
      this.refresh('expert')
    },
    profile: function (newProfile, oldProfile) {
      this.refresh('profile')
    },
    step: function (newStep, oldStep) {
      // needed for when someone clicks on the stepper links, which use strings :(
      this.step = parseInt(newStep)
    }
  }
}
</script>
