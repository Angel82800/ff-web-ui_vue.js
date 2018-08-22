<template>
  <v-card flat>
    <stepButtons @navigate="setStep" :formLoading="form_loading" :formValid="form_valid" :backButton="backButton" :forwardButton="forwardButton" :top="true" :title="pageTitle" />

    <p class="title hidden-sm-and-up" v-html="pageTitle"></p>

    <p class="headline">
      When and where will you need the worker to be?
    </p>

    <v-container fluid grid-list-xl class="pt-0 mb-5">
      <v-layout row justify-center wrap>
        <v-flex xs12 sm6 md3>
          <v-select
            :disabled="form_loading"
            :items="hours"
            v-model="gig.time_start"
            label="Start time"
            single-line
          ></v-select>
        </v-flex>
        <v-flex xs12 sm6 md3>
          <v-select
            :disabled="form_loading"
            :items="hours"
            v-model="gig.time_end"
            label="End time"
            single-line
          ></v-select>
        </v-flex>
      </v-layout>
      <v-layout row justify-space-around wrap>
        <v-flex xs6 sm3 md1 v-for="(day, index) in days" :key="index">
          <div :class="((dayChecked(index)) ? 'black' : 'grey') + '--text headline'">{{ day }}</div>
          <div>
            <v-btn :disabled="form_loading" :outline="!(dayChecked(index))" icon color="primary" class="dow" @click="toggleDay(index)"><v-icon v-html="(dayChecked(index)) ? 'check' : 'add'"></v-icon></v-btn>
          </div>
        </v-flex>
      </v-layout>
      <v-layout justify-center row wrap class="mt-4">
        <v-flex xs12 md8 lg6>
          <vuetify-google-autocomplete v-show="!validatedAddress"
            ref="gacRef0101"
            label="Address lookup*"
            id="gacID0101"
            append-icon="search"
            placeholder="Enter an address"
            :clearable="true"
            v-on:placechanged="googleStreetAddress"
            value=""
            :disabled="form_loading"
            types="address"
            googleApiKey
          >
          </vuetify-google-autocomplete>
          <v-flex xs12 v-show="validatedAddress">
            <v-card color="green lighten-5">
              <v-card-media :src="mapUrl" height="200px"></v-card-media>
              <v-card-text>
                <div style="text-align: left; font-size: 1.2em;">
                  {{ gig.street1 }}<br>
                  {{ gig.city }}, {{ gig.state }} {{ gig.postalCode }}
                </div>
              </v-card-text>
              <v-card-actions>
                <v-spacer />
                <v-btn color="primary" outline @click="addressUpdate()" :disabled="form_loading">edit</v-btn>
                <v-btn color="primary" outline @click="addressRemove()" :disabled="form_loading">Remove</v-btn>
              </v-card-actions>
            </v-card>
          </v-flex>
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
      step: 1,
      form1: false,
      form_loading: false,
      backButton: 'Back',
      forwardButton: 'Next',
      pageTitle: 'When &amp; Where',
      vgaHolder: ''
    }
  },
  computed: {
    form_valid: function () {
      let days = 0
      for (let i = 0; i < this.days.length; i++) {
        days += this.gig['req_' + this.days[i].toLowerCase()]
        i = days ? this.days.length : i
      }
      return (this.gig.time_start && this.gig.time_end) && days && this.validatedAddress
    },
    validatedAddress: function () {
      return this.gig.latitude && this.gig.longitude
    },
    mapUrl: function () {
      let coords = `${this.gig.latitude},${this.gig.longitude}`
      let markers = encodeURIComponent(`color:0x${this.colors.baseGreen}|${coords}`)
      return `https://maps.googleapis.com/maps/api/staticmap?center=${coords}&size=600x200&markers=${markers}&key=${this.googlePlacesKey}`
    },
    ...mapState('vars', ['days', 'hours', 'formRules', 'expertise', 'colors', 'googlePlacesKey'])
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
        let action = (self.gig.id) ? 'update' : 'add'
        self.$store.dispatch(`customerGigs/${action}Gig`, {gig: self.gig})
          .then((savedGig) => {
            // success, we can move on
            self.gig.id = savedGig.id
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
    dayChecked: function (dayIndex) {
      let property = 'req_' + this.days[dayIndex].toLowerCase()
      return this.gig[property]
    },
    toggleDay: function (dayIndex) {
      let property = 'req_' + this.days[dayIndex].toLowerCase()
      this.gig[property] = this.gig[property] ? 0 : 1
    },
    googleStreetAddress: function (data) {
      // deal with this new info
      this.gig = (!this.gig) ? this.$emit('prepare', 1) : this.gig
      this.gig.street1 = `${data.street_number} ${data.route}`
      this.gig.city = data.locality
      this.gig.state = data.administrative_area_level_1
      this.gig.postalCode = data.postal_code
      this.gig.latitude = data.latitude
      this.gig.longitude = data.longitude
      this.gig.locationId = null
    },
    noGoogleStreetAddress: function (data) {
      this.gig = (!this.gig) ? this.$emit('prepare', 1) : this.gig
      this.gig.street1 = ''
      this.gig.city = ''
      this.gig.state = ''
      this.gig.postalCode = ''
      this.gig.latitude = ''
      this.gig.longitude = ''
      this.gig.locationId = null
    },
    addressUpdate: function () {
      let addressString = `${this.gig.street1} ${this.gig.city} ${this.gig.state} ${this.gig.postalCode}`
      this.$refs.gacRef0101.update(addressString)
      this.gig.locationId = null
      this.gig.latitude = null
      this.gig.longitude = null
    },
    addressRemove: function () {
      this.$refs.gacRef0101.clear()
      this.gig.locationId = null
      this.gig.latitude = null
      this.gig.longitude = null
    }
  }
}
</script>
