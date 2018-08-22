<template>
  <v-card flat>
    <stepButtons @navigate="setStep" :formLoading="form_loading" :formValid="form_valid" :backButton="backButton" :forwardButton="forwardButton" :top="true" :title="pageTitle" />

    <p class="title hidden-sm-and-up" v-html="pageTitle"></p>

    <p class="headline">
      Add any additional details you'd like the applicant to know
    </p>

    <v-container fluid grid-list-xl class="pt-0 mb-5 text--left">
      <v-layout justify-center row wrap>
        <v-flex xs12 md10 lg6>
          <v-card flat>
            <v-form>
              <v-text-field label="Any additional details you would like the applicant to be aware of?" textarea v-model="gig.description"></v-text-field>
            </v-form>
          </v-card>
        </v-flex>
      </v-layout>
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
  props: ['gig'],
  data () {
    return {
      step: 5,
      form_loading: false,
      backButton: 'Back',
      forwardButton: 'Review',
      pageTitle: 'Gig description'
    }
  },
  computed: {
    form_valid: function () {
      return true
    },
    exitText: function () {
      switch (this.gig.status) {
        case 'draft':
          return 'Save and Exit'
      }
      return 'Save and Exit!'
    },
    postText: function () {
      switch (this.gig.status) {
        case 'draft':
          return 'Post'
      }
      return 'Post'
    },
    mapUrl: function () {
      let coords = `${this.gig.latitude},${this.gig.longitude}`
      let markers = encodeURIComponent(`color:0x${this.colors.baseGreen}|${coords}`)
      return `https://maps.googleapis.com/maps/api/staticmap?center=${coords}&size=600x200&markers=${markers}&key=${this.googlePlacesKey}`
    },
    ...mapState('customerGigs', ['gigSkills']),
    ...mapState('vars', ['expertise', 'colors', 'googlePlacesKey']),
    ...mapGetters('vars', ['categoriesById']),
    ...mapGetters('customerGigs', ['detailSelected', 'requiredHours', 'requiredDays'])
  },
  methods: {
    getSkillLevel: function (skillId) {
      let self = this
      for (let i = 0; i < self.gigSkills.length; i++) {
        if (self.gigSkills[i].skill_id === skillId) {
          return self.expertise.skillLevels[self.gigSkills[i].level]
        }
      }
    },
    setStep: function (direction) {
      let self = this
      let currentStep = self.step
      let newStep = (direction === 'back') ? currentStep - 1 : currentStep + 1
      new Promise((resolve, reject) => {
        self.form_loading = true
        self.$store.dispatch(`customerGigs/updateGig`, {gig: self.gig})
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
    post: function () {
      // update the status
      this.setStep(parseInt(this.step) + 1)
      this.$store.dispatch(`customerGigs/publishGig`, {gigId: this.gig.id})
    },
    exit: function () {
      this.setStep(0)
    }
  }
}

</script>

<style>
v-text-field {
  display: block;
}
</style>
