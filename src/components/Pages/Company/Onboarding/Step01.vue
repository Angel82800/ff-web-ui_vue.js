<template>
  <v-card flat>
    <v-card-actions class="mb-3">
      <v-btn v-if="step > 1" :loading="form_loading" :disabled="!form_valid || form_loading" @click="setStep(parseInt(step) - 1)" color="primary"><v-icon left dark class="hidden-xs-only">arrow_back</v-icon>{{ backButton }}</v-btn>
      <v-spacer v-if="step === 1"></v-spacer>
      <v-spacer></v-spacer>
      <p class="title hidden-xs-only">
        {{ pageTitle }}
      </p>
      <v-spacer class="hidden-xs-only"></v-spacer>
      <v-btn :loading="form_loading" :disabled="!form_valid || form_loading" @click="setStep(parseInt(step) + 1)" color="primary">{{ forwardButton }}<v-icon right dark class="hidden-xs-only">arrow_forward</v-icon></v-btn>
    </v-card-actions>

    <p class="title hidden-sm-and-up">
      {{ pageTitle }}
    </p>

    <transition name="fade" mode="out-in">
      <div v-if="step === 1" key="1">
        <p class="headline">
          Tell us a little bit about yourself
        </p>
        <v-container fluid class="">
          <v-layout justify-center row wrap>
            <v-flex xs12 md8 lg6>
              <v-form v-model="form1">
                <v-text-field :disabled="form_loading" :rules="[formRules.required]" required name="name_first" label="First Name" type="text" v-model="profile.name_first"></v-text-field>
                <v-text-field :disabled="form_loading" :rules="[formRules.required]" required name="name_last" label="Last Name" type="text" v-model="profile.name_last"></v-text-field>
                <v-text-field v-if="getEmail" :disabled="form_loading" :rules="[formRules.required, formRules.email]" required  name="email" label="Email" type="text" v-model="profile.email"></v-text-field>
              </v-form>
            </v-flex>
          </v-layout>
        </v-container>
      </div>
      <div v-if="step === 2" key="2">
        <p class="headline">
          Let's get to know your business
        </p>
        <v-container fluid class="">
          <v-layout justify-center row wrap>
            <v-flex xs12 md8 lg6>
              <v-form v-model="form2" v-on:submit.prevent="step(2)">
                <vuetify-google-autocomplete
                  ref="gacRef0101"
                  label="Company lookup"
                  id="gacID0101"
                  append-icon="search"
                  placeholder="Enter a company name, city, state and hit enter to search"
                  :clearable="true"
                  v-on:placechanged="googleStreetAddress"
                  value=""
                  :disabled="form_loading"
                  types="establishment"
                  googleApiKey
                  v-on:no-results-found="noGoogleStreetAddress"
                  v-model="vgaHolder"
                >
                <!-- TODO: get better data from component and make 'required' work like other vuetify components -->
                </vuetify-google-autocomplete>
                <div v-show="customerData">
                  <v-text-field :disabled="form_loading" :rules="[formRules.required]" name="name" label="Company Name" type="text" v-model="customerData.name"></v-text-field>
                  <v-text-field :disabled="form_loading" :rules="[formRules.required]" required name="street1" label="Street Address" type="text" v-model="customerData.street1"></v-text-field>
                  <v-text-field :disabled="form_loading" :rules="[formRules.required]" required name="city" label="City" type="text" v-model="customerData.city"></v-text-field>
                  <v-text-field :disabled="form_loading" :rules="[formRules.required]" required name="state" label="State" type="text" v-model="customerData.state"></v-text-field>
                  <v-text-field :disabled="form_loading" :rules="[formRules.required]" required name="postalCode" label="Zip" type="text" v-model="customerData.postalCode"></v-text-field>
                </div>
              </v-form>
            </v-flex>
          </v-layout>
        </v-container>
      </div>
      <!-- <div v-if="step === 3" key="3">
        <p class="headline">
          What hours are you open?
        </p>
        <v-container fluid grid-list-xl class="pt-0 mb-5">
          <v-layout row justify-center wrap>
            <v-flex xs12 sm6 md3>
              <v-select
                :disabled="form_loading"
                :items="hours"
                v-model="customer.open_start"
                label="Start time"
                single-line
              ></v-select>
            </v-flex>
            <v-flex xs12 sm6 md3>
              <v-select
                :disabled="form_loading"
                :items="hours"
                v-model="customer.open_end"
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
        </v-container>
      </div> -->
      <div v-if="step === 3" key="3">
        <p class="headline">
          What industries are you involved in?
        </p>
        <v-btn outline :disabled="form_loading" v-for="(industry, index) in industries" :key="industry.id" :color="industryState(index) ? 'primary': ''" :dark="!form_loading && (industryState(index) ? true : false)" @click.native="toggleIndustry(index)">
          <span v-html="industry.title"></span>
          <v-icon v-html="industryState(index) ? 'check_box' : 'check_box_outline_blank'" right dark>check</v-icon>
        </v-btn>
      </div>
      <div v-if="step === 5" key="5">
        <p class="headline">
          What would you like to do next?
        </p>
        <v-btn>
          Complete my profile so I can get the most out of FactoryFix (what does this mean?)
        </v-btn>
        <v-btn>
          Post a job, now!
        </v-btn>
      </div>
    </transition>

    <v-card-actions class="mb-3">
      <v-btn v-if="step > 1" :loading="form_loading" :disabled="!form_valid || form_loading" @click="setStep(parseInt(step) - 1)" color="primary"><v-icon left dark class="hidden-xs-only">arrow_back</v-icon>{{ backButton }}</v-btn>
      <v-spacer></v-spacer>
      <v-btn :loading="form_loading" :disabled="!form_valid || form_loading" @click="setStep(parseInt(step) + 1)" color="primary">{{ forwardButton }}<v-icon right dark class="hidden-xs-only">arrow_forward</v-icon></v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
import { mapGetters } from 'vuex'
const newCustomerData = () => {
  return {
    name: null,
    street1: null,
    street2: null,
    city: null,
    state: null,
    postalCode: null,
    country: null,
    latitude: null,
    longitude: null,
    locationId: null,
    photo_url: null,
    open_start: 7,
    open_end: 15,
    open_sun: null,
    open_mon: true,
    open_tue: true,
    open_wed: true,
    open_thu: true,
    open_fri: true,
    open_sat: null
  }
}
export default {
  data () {
    return {
      step: 1,
      form_loading: false,
      form1: false,
      form2: false,
      vgaHolder: '', // so we can get the string value of the vuetify google autocomplete component
      customerData: false,
      formRules: this.$store.state.vars.formRules,
      selectedDays: [],
      industries: []
    }
  },
  props: ['customer', 'profile'],
  computed: {
    totalSteps: function () {
      return 3 // TODO: use customerSkillCategories.length to determine if we should have a 5th step asking where the user wants to go (first time users), or just go to the next step
    },
    forwardButton: function () {
      switch (this.step) {
        case 1:
          return 'Location'
        case 2:
        //   return 'Hours'
        // case 3:
          return 'Industries'
        case 3:
          return (this.totalSteps === this.step) ? 'Step 2' : 'Next'
        case 4:
          return 'Step 2'
        default:
          return 'Forward'
      }
    },
    backButton: function () {
      switch (this.step) {
        case 2:
          return 'About you'
        case 3:
          return 'Location'
        // case 4:
        //   return 'Hours'
        case 4:
          return 'Industries'
        default:
          return 'Back'
      }
    },
    pageTitle: function () {
      return (this.step < 5) ? `Basic info (${this.step} of ${this.totalSteps})` : ''
    },
    form_valid: function () {
      switch (this.step) {
        case 1:
          return this.form1
        case 2:
          return this.form2
        case 3:
        //   let days = 0
        //   for (let i = 0; i < this.days.length; i++) {
        //     days += this.customer['open_' + this.days[i].toLowerCase()]
        //     i = days ? this.days.length : i
        //   }
        //   return (this.customer.open_start && this.customer.open_end) && days
        // case 4:
          for (let i = 0; i < this.industries.length; i++) {
            if (this.industries[i].selected) {
              return true
            }
          }
          return false
        default:
          return true
      }
    },
    getEmail: function () {
      // if this is a social profie, we may need an email address added. If it is an Auth0 username/pwd profile, we have their email address ... somewhere
      return !this.profile.auth0_sub_id || this.profile.auth0_sub_id.split('|')[0].indexOf('auth0') === -1
    },
    // ...mapState('vars', ['hours', 'days']),
    ...mapGetters('customerIndustries', ['industrySelected'])
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
          case 1:
            savePromise = this.saveForm1()
            break
          case 2:
            savePromise = this.saveForm2()
            break
          case 3:
          //   savePromise = this.saveForm3()
          //   break
          // case 4:
            savePromise = this.saveForm4()
            break
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
                case 2:
                  this.prepForm2()
                  break
                case 3:
                  this.prepForm4()
                  break
                case 4:
                  this.prepStep2()
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
    },
    saveForm1: function () {
      let self = this
      return new Promise((resolve, reject) => {
        this.$store.dispatch('userProfile/updateMyProfile', {userProfile: this.profile})
          .then(() => {
            self.$emit('refresh', ['profile'])
            resolve()
          })
          .catch((error) => {
            reject(error)
          })
      })
    },
    prepForm2: function () {
      let self = this
      // get existing customer data or leave false
      let tmpCustomerData = self.customer
      self.customerData = newCustomerData()
      for (let prop in tmpCustomerData) {
        self.customerData[prop] = tmpCustomerData[prop]
      }
    },
    googleStreetAddress: function (data) {
      if (data) {
        // deal with this new info
        this.customerData = (!this.customerData) ? newCustomerData() : this.customerData
        this.customerData.name = ''
        this.customerData.street1 = `${data.street_number} ${data.route}`
        this.customerData.city = data.locality
        this.customerData.state = data.administrative_area_level_1
        this.customerData.postalCode = data.postal_code
        this.customerData.latitude = data.latitude
        this.customerData.longitude = data.longitude
        this.customerData.locationId = null
      }
    },
    noGoogleStreetAddress: function (data) {
      if (data) {
        this.customerData = (!this.customerData) ? newCustomerData() : this.customerData
        this.customerData.name = data.name
        this.customerData.street1 = ''
        this.customerData.city = ''
        this.customerData.state = ''
        this.customerData.postalCode = ''
        this.customerData.latitude = ''
        this.customerData.longitude = ''
        this.customerData.locationId = null
      }
    },
    saveForm2: function () {
      let self = this
      return new Promise((resolve, reject) => {
        let action = (this.customerData.id) ? 'update' : 'add'
        self.$store.dispatch(`customer/${action}MyCustomer`, {customer: this.customerData})
          .then(() => {
            self.$emit('refresh', ['customer'])
            resolve()
          })
          .catch((error) => {
            reject(error)
          })
      })
    },
    // toggleDay: function (dayIndex) {
    //   let property = 'open_' + this.days[dayIndex].toLowerCase()
    //   this.customer[property] = this.customer[property] ? 0 : 1
    // },
    // dayChecked: function (dayIndex) {
    //   let property = 'open_' + this.days[dayIndex].toLowerCase()
    //   return this.customer[property]
    // },
    // saveForm3: function () {
    //   let self = this
    //   return new Promise((resolve, reject) => {
    //     self.$store.dispatch(`customer/updateMyCustomer`, {customer: this.customer})
    //       .then(() => {
    //         self.$emit('refresh', ['customer'])
    //         resolve()
    //       })
    //       .catch((error) => {
    //         reject(error)
    //       })
    //   })
    // },
    prepForm4: function () {
      this.industries = []
      for (let i = 0; i < this.$store.state.vars.expertise.industries.length; i++) {
        this.industries.push({
          industry_id: this.$store.state.vars.expertise.industries[i].id,
          title: this.$store.state.vars.expertise.industries[i].title,
          selected: this.industrySelected(this.$store.state.vars.expertise.industries[i].id)
        })
      }
    },
    industryState: function (index) {
      if (index < this.industries.length) {
        return this.industries[index].selected
      }
      return false
    },
    toggleIndustry: function (index) {
      if (!this.form_loading) {
        if (index < this.industries.length) {
          this.industries[index].selected = !this.industries[index].selected
        }
      }
    },
    saveForm4: function () {
      let self = this
      let selectedIndustryIds = []
      return new Promise((resolve, reject) => {
        for (let i = 0; i < self.industries.length; i++) {
          if (self.industries[i].selected) {
            selectedIndustryIds.push(self.industries[i].industry_id)
          }
        }
        console.log('about to replace my industries')
        self.$store.dispatch('customerIndustries/replaceMyIndustries', {industries: selectedIndustryIds})
          .then((result) => {
            resolve()
          })
          .catch((error) => {
            reject(error)
          })
      })
    },
    prepStep2: function () {
      this.$store.dispatch('customerSkills/initMyData')
    }
  },
  mounted () {
    // make sure we have the data for this step
    let self = this
    self.form_loading = true
    let promises = []
    promises.push(self.$store.dispatch('vars/initData'))
    promises.push(self.$store.dispatch('customer/initMyData'))

    Promise.all(promises)
      .catch((error) => {
        console.error(error)
      })
      .finally(() => {
        self.form_loading = false
      })
  },
  watch: {
    vgaHolder: function (newData, oldData) {
      if (newData.trim() && newData !== oldData) {
        this.customerData.name = newData.split(',')[0]
        this.$refs.gacRef0101.update(' ')
      }
    }
  }
}
</script>
