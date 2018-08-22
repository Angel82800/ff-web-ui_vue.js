<template>
  <div>
    <v-card flat>
      <v-card-actions class="mb-3">
        <v-btn :loading="formsLoading" :disabled="formsLoading" @click="setStep(0)" color="primary"><v-icon left dark>arrow_back</v-icon><span class="hidden-xs-only">Step 3</span></v-btn>
        <v-spacer></v-spacer>
        <p class="title hidden-xs-only">
          When are you available to work?
        </p>
        <v-spacer class="hidden-xs-only"></v-spacer>
        <v-btn :loading="formsLoading" :disabled="!form_1_valid || formsLoading" @click="setStep(2)" color="primary"><span class="hidden-xs-only">Step 5</span><v-icon right dark>arrow_forward</v-icon></v-btn>
      </v-card-actions>
      <p class="title hidden-sm-and-up">
        When are you available to work?
      </p>
      <v-container fluid grid-list-xl>
        <v-layout row justify-center wrap>
          <v-flex xs12 sm6 md3>
            <v-select
              :disabled="form_1_loading"
              :items="hours"
              v-model="expert.available_start"
              label="Start time"
              single-line
            ></v-select>
          </v-flex>
          <v-flex xs12 sm6 md3>
            <v-select
              :disabled="form_1_loading"
              :items="hours"
              v-model="expert.available_end"
              label="End time"
              single-line
            ></v-select>
          </v-flex>
        </v-layout>
      </v-container>
      <v-container fluid grid-list-xl class="mb-5">
        <v-layout row justify-space-around wrap>
          <v-flex xs6 sm3 md1 v-for="(day, index) in days" :key="index">
            <div :class="((dayChecked(index)) ? 'black' : 'grey') + '--text headline'">{{ day }}</div>
            <div>
              <v-btn :disabled="form_1_loading" :outline="!(dayChecked(index))" icon color="primary" class="dow" @click="toggleDay(index)"><v-icon v-html="(dayChecked(index)) ? 'check' : 'add'"></v-icon></v-btn>
            </div>
          </v-flex>
        </v-layout>
      </v-container>
      <v-card-actions>
        <v-btn :loading="formsLoading" :disabled="formsLoading" @click="setStep(0)" color="primary"><v-icon left dark>arrow_back</v-icon><span class="hidden-xs-only">Step 3</span></v-btn>
        <v-spacer></v-spacer>
        <v-btn :loading="formsLoading" :disabled="!form_1_valid || formsLoading" @click="setStep(2)" color="primary"><span class="hidden-xs-only">Step 5</span><v-icon right dark>arrow_forward</v-icon></v-btn>
      </v-card-actions>

    </v-card>
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
export default {
  data () {
    return {
      formsLoading: false,
      form_1_loading: false,
      formRules: this.$store.state.vars.formRules,
      step: 1,
      selectedDays: []
    }
  },
  props: ['expert'],
  computed: {
    form_1_valid: function () {
      return this.selectedDays.length && (typeof this.expert.available_start !== 'undefined' && typeof this.expert.available_end !== 'undefined') && this.expert.available_start < this.expert.available_end
    },
    ...mapState('expertAvailability', ['availability']),
    ...mapState('vars', ['hours', 'days']),
    ...mapGetters('expertAvailability', ['availabilityById', 'availabilityProcessing']),
    ...mapGetters('vars', ['availabilityName'])
  },
  mounted: function () {
    this.form_1_loading = true
    // make sure we have the data for this step
    let self = this
    let promises = []
    promises.push(self.$store.dispatch('vars/initData'))
    promises.push(self.$store.dispatch('expert/initMyData'))

    Promise.all(promises)
      .then(() => {
        this.selectedDays = []
        for (let i = 0; i < this.days.length; i++) {
          if (this.expert['available_' + this.days[i].toLowerCase()]) {
            this.selectedDays.push(i)
          }
        }
      })
      .catch((error) => {
        console.error(error)
      })
      .finally(() => {
        self.form_1_loading = false
      })
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
          break
        case 'Network Error':
          // TODO: use alert
          console.log('alert')
          break
      }
    },
    setStep: function (newStep) {
      let self = this
      let currentStep = self.step
      console.log('entering step set with', newStep, currentStep)
      new Promise((resolve, reject) => {
        switch (currentStep) {
          case 1:
            console.log('leaving 1')
            self.form_1_loading = true
            this.saveForm1()
              .then(() => {
                // success, we can move on
                if (newStep === 2) {
                  console.log('preparing for step 5')
                }
                resolve(newStep)
              })
              .catch((error) => {
                console.log('error in setStep.stepWork')
                this.handleNetworkError(error)
                reject(error)
              })
              .finally(() => {
                self.form_1_loading = false
              })
            break
        }
      })
        .then((step) => {
          if (step === 2) {
            self.$emit('navigate', 'next')
            self.step = 1
          } else if (step === 0) {
            self.$emit('navigate', 'back')
            self.step = 1
          } else {
            self.step = step
            this.$ga.page({
              page: this.$route.path + '/1/' + this.step
            })
          }
        })
        .catch((error) => {
          console.log('error in setStep resolution')
          throw error
        })
        .finally(() => {
          console.log('completing set step')
        })
    },
    saveForm1 () {
      let self = this
      return new Promise((resolve, reject) => {
        // translate form to expert data and save
        for (let i = 0; i < self.days.length; i++) {
          if (self.selectedDays.indexOf(i) > -1) {
            self.expert['available_' + self.days[i].toLowerCase()] = 1
          } else {
            self.expert['available_' + self.days[i].toLowerCase()] = 0
          }
        }
        self.$store.dispatch('expert/updateMyExpert', {expert: self.expert})
          .then((result) => {
            self.$emit('refresh', ['expert'])
            resolve()
          })
          .catch((error) => {
            console.error(error)
            throw error
          })
      })
    },
    toggleDay: function (which) {
      let index = this.selectedDays.indexOf(which)
      if (index > -1) {
        this.selectedDays.splice(index, 1)
      } else {
        this.selectedDays.push(which)
      }
    },
    dayChecked: function (which) {
      return (this.selectedDays.indexOf(which) > -1)
    }
  }
}
</script>
