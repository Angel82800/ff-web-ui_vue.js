<template>
  <v-card flat>
    <v-card-actions class="mb-3">
      <v-btn v-if="step > 1" :loading="form_loading" :disabled="!form_valid || form_loading" @click="setStep(step - 1)" color="primary"><v-icon left dark class="hidden-xs-only">arrow_back</v-icon>{{ backButton }}</v-btn>
      <v-spacer v-if="step === 1"></v-spacer>
      <v-spacer></v-spacer>
      <p class="title hidden-xs-only">
        {{ pageTitle }}
      </p>
      <v-spacer class="hidden-xs-only"></v-spacer>
      <v-btn :loading="form_loading" :disabled="!form_valid || form_loading" @click="setStep(step + 1)" color="primary">{{ forwardButton }}<v-icon right dark class="hidden-xs-only">arrow_forward</v-icon></v-btn>
    </v-card-actions>

    <p class="title hidden-sm-and-up">
      {{ pageTitle }}
    </p>

    <transition name="fade" mode="out-in">
      <div v-if="step === 1" key="1">
        <p class="headline">
          Tell us a little bit about yourself
        </p>
      </div>
    </transition>
    <v-card-actions class="mb-3">
      <v-btn v-if="step > 1" :loading="form_loading" :disabled="!form_valid || form_loading" @click="setStep(step - 1)" color="primary"><v-icon left dark class="hidden-xs-only">arrow_back</v-icon>{{ backButton }}</v-btn>
      <v-spacer></v-spacer>
      <v-btn :loading="form_loading" :disabled="!form_valid || form_loading" @click="setStep(step + 1)" color="primary">{{ forwardButton }}<v-icon right dark class="hidden-xs-only">arrow_forward</v-icon></v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
export default {
  data () {
    return {
      step: 1,
      form_loading: false,
      formRules: this.$store.state.vars.formRules
    }
  },
  props: [],
  computed: {
    totalSteps: function () {
      return 4
    },
    forwardButton: function () {
      switch (this.step) {
        default:
          return 'Forward'
      }
    },
    backButton: function () {
      switch (this.step) {
        default:
          return 'Back'
      }
    },
    pageTitle: function () {
      return (this.step < 5) ? `Basic info (${this.step} of ${this.totalSteps})` : ''
    },
    form_valid: function () {
      switch (this.step) {
        default:
          return true
      }
    }
  },
  methods: {
    setStep: function (newStep) {
      let self = this
      let currentStep = self.step
      console.log('entering step set with', newStep, currentStep)
      new Promise((resolve, reject) => {
        let savePromise
        self.form_loading = true
        console.log('leaving', currentStep)
        switch (currentStep) {
          // case 1:
          //   savePromise = this.saveForm1()
          //   break
          default:
            savePromise = new Promise((resolve, reject) => {
              resolve()
            })
            break
        }
        savePromise
          .then(() => {
            // success, we can move on
            if (newStep === currentStep + 1) {
              // prepare for next step
              switch (newStep) {
                // case 2:
                //   this.prepForm2()
                //   break
                default:
                  // placeholder
                  break
              }
            }
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
          if (step === (this.totalSteps + 1)) {
            self.$emit('navigate', 'next')
            self.step = 1
          } else if (step === 0) {
            self.$emit('navigate', 'back')
            self.step = 1
          } else {
            self.step = step
          }
        })
        .catch((error) => {
          console.error('error in setStep resolution', error)
          self.$emit('networkError', error)
        })
        .finally(() => {
          console.log('completing set step')
        })
    }
  },
  mounted () {
    // make sure we have the data for this step
    let self = this
    self.form_loading = true
    let promises = []
    // promises.push(self.$store.dispatch('vars/initData'))
    // promises.push(self.$store.dispatch('customer/initMyData'))

    Promise.all(promises)
      .catch((error) => {
        console.error(error)
      })
      .finally(() => {
        self.form_loading = false
      })
  }
}
</script>
