<template>
  <v-card flat>
    <v-card-actions class="mb-3">
      <v-btn :loading="formLoading" :disabled="formLoading" @click="setStep(parseInt(step) - 1)" color="primary"><v-icon left dark class="hidden-xs-only">arrow_back</v-icon>{{ backButton }}</v-btn>
      <v-spacer></v-spacer>
      <p class="title hidden-xs-only">
        {{ pageTitle }}
      </p>
      <v-spacer class="hidden-xs-only"></v-spacer>
    </v-card-actions>

    <p class="title hidden-sm-and-up">
      {{ pageTitle}}
    </p>

    <v-container fluid grid-list-xl>
      <v-layout row justify-center wrap>
        <v-flex xs12 sm6 md3>
          <v-select
            :disabled="formLoading"
            :items="hours"
            v-model="expertForm.available_start"
            label="Start time"
            single-line
          ></v-select>
        </v-flex>
        <v-flex xs12 sm6 md3>
          <v-select
            :disabled="formLoading"
            :items="hours"
            v-model="expertForm.available_end"
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
            <v-btn :disabled="formLoading" :outline="!(dayChecked(index))" icon color="primary" class="dow" @click="toggleDay(index)"><v-icon v-html="(dayChecked(index)) ? 'check' : 'add'"></v-icon></v-btn>
          </div>
        </v-flex>
      </v-layout>
    </v-container>

    <v-card-actions class="mb-3">
      <v-btn :loading="formLoading" :disabled="formLoading" @click="setStep(parseInt(step) - 1)" color="primary"><v-icon left dark class="hidden-xs-only">arrow_back</v-icon>{{ backButton }}</v-btn>
      <v-spacer></v-spacer>
    </v-card-actions>
  </v-card>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
export default {
  props: ['expertForm'],
  data () {
    return {
      formLoading: false,
      formRules: this.$store.state.vars.formRules,
      step: 1,
      selectedDays: [],
      totalSteps: 1
    }
  },
  computed: {
    formValid: function () {
      return this.selectedDays.length && (typeof this.expertForm.available_start !== 'undefined' && typeof this.expertForm.available_end !== 'undefined') && this.expertForm.available_start < this.expertForm.available_end
    },
    backButton: function () {
      switch (this.step) {
        default:
          return 'Back'
      }
    },
    pageTitle: function () {
      return 'When is the expert available to work?'
    },
    ...mapState('expertAvailability', ['availability']),
    ...mapState('vars', ['hours', 'days']),
    ...mapGetters('expertAvailability', ['availabilityById', 'availabilityProcessing']),
    ...mapGetters('vars', ['availabilityName'])
  },
  methods: {
    setStep: function (newStep) {
      let self = this
      let currentStep = self.step
      // console.log('entering step set with', newStep, currentStep)
      new Promise((resolve, reject) => {
        let savePromise
        self.formLoading = true
        // console.log('leaving', currentStep)
        switch (true) {
          case (self.formValid && currentStep === 1):
            savePromise = this.saveForm1()
            break
        }
        savePromise
          .then(() => {
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
          if (step === (this.totalSteps + 1) || step === 0) {
            this.$emit('setView', 'review')
            self.step = 1
          } else {
            self.step = step
          }
        })
        .catch((error) => {
          console.error('error in setStep resolution', error)
          self.$emit('networkError', error)
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
    },
    saveForm1: function () {
      let self = this
      return new Promise((resolve, reject) => {
        // translate form to expert data and save
        for (let i = 0; i < self.days.length; i++) {
          if (self.selectedDays.indexOf(i) > -1) {
            self.expertForm['available_' + self.days[i].toLowerCase()] = 1
          } else {
            self.expertForm['available_' + self.days[i].toLowerCase()] = 0
          }
        }
        self.$store.dispatch('expert/updateExpert', {expert: self.expertForm})
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
    remount: function () {
      let self = this
      self.form_loading = true
      let promises = []
      promises.push(self.$store.dispatch('vars/initData'))
      promises.push(self.$store.dispatch('expert/getExpert', {userProfileId: self.expertForm.userProfileId}))

      Promise.all(promises)
        .then(() => {
          self.selectedDays = []
          for (let i = 0; i < self.days.length; i++) {
            if (self.expertForm['available_' + self.days[i].toLowerCase()]) {
              self.selectedDays.push(i)
            }
          }
        })
        .catch((error) => {
          console.error(error)
        })
        .finally(() => {
          self.formLoading = false
        })
    }
  },
  mounted () {
    // make sure we have the data for this step
    this.remount()
  }
}
</script>
