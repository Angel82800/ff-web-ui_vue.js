<template>
  <div>
    <v-card flat>
      <v-card-actions class="mb-3">
        <v-btn :loading="formsLoading" :disabled="!form_1_valid || formsLoading" @click="setStep(0)" color="primary"><v-icon left dark>arrow_back</v-icon><span class="hidden-xs-only">Step 2</span></v-btn>
        <v-spacer></v-spacer>
        <p class="title hidden-xs-only">
          Employment history
        </p>
        <v-spacer class="hidden-xs-only"></v-spacer>
        <v-btn :loading="formsLoading" :disabled="!form_1_valid || form_1_loading" @click="setStep(4)" color="primary"><span class="hidden-xs-only">Step 4</span><v-icon right dark>arrow_forward</v-icon></v-btn>
      </v-card-actions>
      <transition name="fade" mode="out-in">
        <div v-if="step === 1" key="1">
          <p class="title hidden-sm-and-up">
            Employment history
          </p>
          <v-btn large outline color="primary" @click="addEmployer()">Add an employer record <v-icon right>add</v-icon></v-btn>
          <v-container fluid class="pb-0">
            <v-layout justify-center>
              <v-flex xs12 md8 lg6>
                <transition-group name="fade" mode="out-in">
                  <v-card v-for="employer in employers" :key="employer.id" class="elevation-4 text-xs-left mb-4">
                    <v-card-title primary-title class="py-2 grey white--text">
                      <h3 class="headline">{{ employer.name }}</h3>
                    </v-card-title>
                    <v-card-text>
                      <h3 class="mb-2">{{ employer.startYYYYMM }} &mdash; {{ employer.endYYYYMM || 'present'}}</h3>
                      <h3 v-if="employer.pay_rate > 0" v-html="'Hourly rate: $' + employer.pay_rate"></h3>
                      <!-- <v-chip v-for="(skillDetail, index) in employerSkillDetails({employerId: employer.id})" :key="index">
                        {{skillDetailName({skillDetailId: skillDetail.expert_skill_detail_skill_detail_id})}}
                      </v-chip> -->
                    </v-card-text>
                    <v-card-actions>
                      <v-btn color="primary" flat @click="editEmployer(employer.id)">Edit<v-icon right>edit</v-icon></v-btn>
                      <v-spacer></v-spacer>
                      <v-btn color="primary" flat @click="deleteEmployer(employer.id)">Delete<v-icon right>delete</v-icon></v-btn>
                    </v-card-actions>
                  </v-card>
                </transition-group>
              </v-flex>
            </v-layout>
          </v-container>
          <v-btn v-if="employers.length" large outline color="primary" @click="addEmployer()">Add an employer record <v-icon right>add</v-icon></v-btn>
        </div>
        <div v-if="step === 2" key="2">
          <v-container fluid class="">
            <v-layout justify-center row wrap>
              <v-flex xs12 md8 lg6>
                <v-card>
                  <v-card-title primary-title class="py-2 primary white--text">
                    <h3 class="headline" v-html="(employerData.id ? 'Edit' : 'Add') + ' employer'"></h3>
                  </v-card-title>
                  <v-card-text>
                    <v-form v-model="form_2_valid" v-on:submit.prevent="form_2_save">
                      <month-year label="Start date"
                        :months="months"
                        :years="employmentYearRange"
                        :month="employerData.startYYYYMM ? employerData.startYYYYMM.substr(4,2) : ''"
                        :year="employerData.startYYYYMM ? employerData.startYYYYMM.substr(0,4) : ''"
                        :rules="[formRules.employmentDate]"
                        remoteError=""
                        :disabled="form_2_loading"
                        :required="true"
                        @update="updateStartDate"></month-year>
                      <month-year label="End date (blank = current)"
                        :months="months"
                        :years="employmentYearRange"
                        :month="employerData.endYYYYMM ? employerData.endYYYYMM.substr(4,2) : ''"
                        :year="employerData.endYYYYMM ? employerData.endYYYYMM.substr(0,4) : ''"
                        :rules="[formRules.employmentDate]"
                        :remoteError="afterStartDate"
                        :disabled="form_2_loading"
                        :required="false"
                        @update="updateEndDate"></month-year>
                      <!-- <v-text-field
                        v-model="employerData.startYYYYMM"
                        label="Start Date "
                        :clearable="true"
                        prepend-icon="event"
                        type="month"
                        required
                        :rules="[ formRules.employmentDate, afterStartDate]"
                        :disabled="form_2_loading"
                      ></v-text-field>
                      <v-text-field
                        label="End Date (blank = current) "
                        v-model="employerData.endYYYYMM"
                        :clearable="true"
                        type="month"
                        prepend-icon="event"
                        :rules="[formRules.employmentDate, afterStartDate]"
                        :disabled="form_2_loading"
                      ></v-text-field> -->

                      <v-text-field :disabled="form_2_loading" :rules="[formRules.required]" required prefix="$" name="pay_rate" label="Hourly rate" type="text" v-model="employerData.pay_rate"></v-text-field>

                      <vuetify-google-autocomplete
                        ref="googleautocompleteRefSte03_01"
                        label="Company lookup"
                        id="googleautocompleteIdStep03_01"
                        append-icon="search"
                        placeholder="Search with a company name, city, state and hit enter"
                        :clearable="true"
                        v-on:placechanged="googleStreetAddress"
                        value=""
                        :disabled="form_1_loading"
                        types="establishment"
                        googleApiKey
                        v-on:no-results-found="noGoogleStreetAddress"
                        v-model="vgaHolder"
                      >
                      <!-- TODO: get better data from component and make 'required' work like other vuetify components -->
                      </vuetify-google-autocomplete>
                      <div v-show="employerData.postalCode">
                        <span v-html="employerData.name"></span><br>
                        <span v-html="employerData.street1"></span><br>
                        <span v-html="employerData.city"></span><br>
                        <span v-html="employerData.state"></span><br>
                        <span v-html="employerData.postalCode"></span><br>
                        <v-text-field v-show="false" :disabled="form_2_loading" :rules="[formRules.required]" name="name" label="Company Name" type="text" v-model="employerData.name"></v-text-field>
                        <!-- <v-text-field :disabled="form_2_loading" :rules="[formRules.required]" required name="street1" label="Street Address" type="text" v-model="employerData.street1"></v-text-field>
                        <v-text-field :disabled="form_2_loading" :rules="[formRules.required]" required name="city" label="City" type="text" v-model="employerData.city"></v-text-field>
                        <v-text-field :disabled="form_2_loading" :rules="[formRules.required]" required name="state" label="State" type="text" v-model="employerData.state"></v-text-field>
                        <v-text-field :disabled="form_2_loading" :rules="[formRules.required]" required name="postalCode" label="Zip" type="text" v-model="employerData.postalCode"></v-text-field> -->
                      </div>
                    </v-form>
                  </v-card-text>
                  <v-card-actions>
                    <v-btn color="primary" flat @click="setStep(1)">Cancel<v-icon right>cancel</v-icon></v-btn>
                    <v-spacer></v-spacer>
                    <v-btn :loading="form_2_loading" :disabled="!form_2_valid || form_2_loading" color="primary" flat @click="setStep(1)">Save<v-icon right>save</v-icon></v-btn>
                  </v-card-actions>
                </v-card>
              </v-flex>
            </v-layout>
          </v-container>
        </div>
        <!-- <div v-if="step === 3" key="3">
          <h2>We want to learn about your experience.<br>Which of your skills did you use at this company?</h2>
          <v-container>
            <v-layout row wrap>
              <v-flex xs12 md6>
                <v-card class="elevation-3 mb-3 mx-1">
                  <v-card-title>
                    <h3 class="headline">Skills used at {{employerData.name}}</h3>
                  </v-card-title>
                  <v-card-text>
                    <p v-show="!employerSkillDetails({employerId: employerData.id}).length">None selected</p>
                    <transition-group name="fade" mode="out-in" tag="div">
                      <v-btn class="btnLower" @click="deleteEmployerSkillDetail(skillDetail.expert_skill_detail_skill_detail_id)" :disabled="employerSkillDetailProcessing({skillDetailId: skillDetail.expert_skill_detail_skill_detail_id})" :loading="employerSkillDetailProcessing({skillDetailId: skillDetail.expert_skill_detail_skill_detail_id})" color="primary" outline small round v-for="(skillDetail, index) in employerSkillDetails({employerId: employerData.id})" :key="index">
                        <v-icon>delete</v-icon>
                        <span>{{skillDetailName({skillDetailId: skillDetail.expert_skill_detail_skill_detail_id})}}</span>
                      </v-btn>
                    </transition-group>
                  </v-card-text>
                </v-card>
              </v-flex>
              <v-flex xs12 md6>
                <v-card class="elevation-3 mb-3 mx-1">
                  <v-card-title>
                    <h3 class="headline">Click a skill to add it to this employer</h3>
                  </v-card-title>
                  <v-card-text>
                    <p v-show="!unusedDetails(employerSkillDetails({employerId: employerData.id})).length">None remaining</p>
                    <transition-group name="fade" mode="out-in" tag="div">
                      <v-btn class="btnLower" @click="addEmployerSkillDetail(skillDetail.skill_detail_id)" :disabled="employerSkillDetailProcessing({skillDetailId: skillDetail.skill_detail_id})" :loading="employerSkillDetailProcessing({skillDetailId: skillDetail.skill_detail_id})" color="grey" outline small round v-for="(skillDetail, index) in unusedDetails(employerSkillDetails({employerId: employerData.id}))" :key="index">
                        <v-icon>add</v-icon>
                        <span>{{skillDetailName({skillDetailId: skillDetail.skill_detail_id})}}</span>
                      </v-btn>
                    </transition-group>
                  </v-card-text>
                </v-card>
              </v-flex>
              <v-flex xs12 >
                <v-btn :disabled="!form_3_valid" outline color="primary" @click="setStep(1)">
                  Done adding skills
                  <v-icon right>check</v-icon>
                </v-btn>
              </v-flex>
            </v-layout>
          </v-container>
        </div> -->
      </transition>
      <v-card-actions>
        <v-btn :loading="formsLoading" :disabled="!form_1_valid || formsLoading" @click="setStep(0)" color="primary"><v-icon left dark>arrow_back</v-icon><span class="hidden-xs-only">Step 2</span></v-btn>
        <v-spacer></v-spacer>
        <v-btn :loading="formsLoading" :disabled="!form_1_valid || form_1_loading" @click="setStep(4)" color="primary"><span class="hidden-xs-only">Step 4</span><v-icon right dark>arrow_forward</v-icon></v-btn>
      </v-card-actions>
    </v-card>
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import { VMoney } from 'v-money'
import MonthYear from '@/components/Parts/MonthYear'

const newEmployerData = (userProfileId) => {
  return {
    name: '',
    street1: '',
    city: '',
    state: '',
    postalCode: '',
    startYYYYMM: '',
    endYYYYMM: '',
    startMMYYYY: '', // for human readability in form
    endMMYYYY: '',
    endYYYYMMsort: '',
    userProfileId: userProfileId,
    pay_rate: ''
  }
}
export default {
  components: {
    monthYear: MonthYear
  },
  directives: {money: VMoney},
  data () {
    return {
      step: 1,
      form_1_loading: false,
      form_2_loading: false,
      form_2_valid: false,
      form_3_loading: false,
      validatedAddress: false,
      vgaHolder: '', // so we can get the string value of the vuetify google autocomplete component
      companySearchInput: '',
      expert_employer: false,
      employerData: false, // we use this for editing an expert employer and for holding data we get back from google places
      startYYYYMMmodal: false,
      endYYYYMMmodal: false,
      money: {
        decimal: '.',
        thousands: ',',
        prefix: '$',
        precision: 0
      }
    }
  },
  computed: {
    form_1_valid: function () {
      // we need not be on the employer add/edit page (used to need to have at least one employer)
      return (this.step === 1) // && this.employers.length
    },
    form_3_valid: function () {
      return true // this.employerSkillDetails({employerId: this.employerData.id}).length // no longer required
    },
    afterStartDate: function () {
      // this test is only necessary if an end date has been entered
      if (this.employerData.endYYYYMM === null || this.employerData.endYYYYMM.trim() === '') {
        return false
      }
      return (this.employerData.startYYYYMM < this.employerData.endYYYYMM) ? false : 'End date must be after start date'
    },
    datePickerMax: function () {
      let d = new Date()
      return (d.getFullYear() + '-' + (d.getMonth() + 1).toString().padStart(2, '0'))
    },
    formsLoading: function () {
      return this.form_1_loading || this.form_2_loading || this.form_3_loading
    },
    ...mapState('vars', ['months', 'employmentYearRange', 'formRules']),
    ...mapState('expertHistory', ['employers', 'skillDetails']),
    ...mapGetters('expertHistory', ['employerSkillDetails', 'employerSkillDetailProcessing']),
    ...mapGetters('vars', ['skillDetailName']),
    ...mapGetters('expertSkills', ['unusedDetails', 'skillDetailIdFromDetailId'])
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
      // update path based on step
      // stepwork is a bootstrap for handling stuff that has to happen between transitions
      let stepWork = new Promise((resolve, reject) => {
        switch (currentStep) {
          case 2:
            console.log('leaving 2')
            this.saveEmployer()
              .then(() => {
                // success, we can move on
                resolve(newStep)
                self.clearEmployerData()
              })
              .catch((error) => {
                console.log('error in setStep.stepWork')
                this.handleNetworkError(error)
                reject(error)
              })
              .finally(() => {
                self.form_2_loading = false
              })
            //   // we'll want to save the form
            //   self.form_2_loading = true
            //   this.saveEmployer()
            //     .then(() => {
            //       // success, we can move on
            //       if (newStep === 3) {
            //         console.log('preparing for step 3')
            //         // self.prepSkillDetails()
            //       }
            //       resolve(newStep)
            //     })
            //     .catch((error) => {
            //       console.log('error in setStep.stepWork')
            //       this.handleNetworkError(error)
            //       reject(error)
            //     })
            //     .finally(() => {
            //       self.form_2_loading = false
            //     })
            // } else {
            //   self.clearEmployerData()
            //   resolve(newStep)
            // }
            break
          case 1:
          default:
            resolve(newStep)
            break
        }
      })
      stepWork
        .then((step) => {
          if (step === 4) {
            self.$emit('navigate', 'next')
            self.step = 1
          } else if (step === 0) {
            self.$emit('navigate', 'back')
            self.step = 1
          } else {
            self.step = step
            this.$ga.page({
              page: this.$route.path + '/3/' + this.step
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
    editEmployer: function (id) {
      let self = this
      self.employerData = newEmployerData(self.$store.state.userProfile.mine.id)
      // load employer into edit form
      console.log(id)
      let tmpEmployerData = self.employers.find((employer) => {
        return employer.id === id
      })
      for (let prop in tmpEmployerData) {
        self.employerData[prop] = tmpEmployerData[prop]
      }
      self.employerData.startMMYYYY = self.employerData.startYYYYMM.toString().substr(4, 2) + self.employerData.startYYYYMM.toString().substr(0, 4)
      self.employerData.endMMYYYY = (!self.employerData.endYYYYMM) ? null : self.employerData.endYYYYMM.toString().substr(4, 2) + self.employerData.endYYYYMM.toString().substr(0, 4)
      // set step to 2 for transition
      self.setStep(2)
    },
    addEmployer: function () {
      let self = this
      // clear employer data from edit form
      self.employerData = newEmployerData(self.$store.state.userProfile.mine.id)
      // set step to 2 for transition
      self.setStep(2)
    },
    deleteEmployer: function (employerId) {
      // whack the employer in question
      let self = this
      return new Promise((resolve, reject) => {
        self.$store.dispatch('expertHistory/deleteMyEmployer', {employerId})
          .then(() => {
            resolve()
          })
          .catch((error) => {
            console.error(error)
          })
      })
    },
    saveEmployer: function () {
      // 1. send selections to API
      let self = this
      return new Promise((resolve, reject) => {
        // fix mmyyyy yyyymm before sending
        self.employerData.endYYYYMMsort = self.employerData.endYYYYMM || 9999999
        // fix pay rate before sending
        self.employerData.pay_rate = self.employerData.pay_rate.replace('$', '')
        self.$store.dispatch('expertHistory/replaceMyEmployer', {employer: self.employerData})
          .then((result) => {
            self.employerData.id = result.id
            // 2. make sure we have data for next step
            let promises = []
            promises.push(self.$store.dispatch('vars/initData'))
            promises.push(self.$store.dispatch('expertSkills/getMySkills', {override: result}))
            Promise.all(promises)
              .then(() => {
                // 3. go to next step
                resolve()
              })
              .catch((error) => {
                console.error(error)
                reject(error)
              })
          })
          .catch((error) => {
            console.error(error)
            reject(error)
          })
      })
    },
    clearEmployerData: function () {
      this.employerData = newEmployerData(this.$store.state.userProfile.mine.id)
      this.form_2_loading = false
    },
    googleStreetAddress: function (data) {
      if (data) {
        console.log(data)
        // deal with this new info
        this.employerData.name = data.name
        this.employerData.street1 = `${data.street_number} ${data.route}`
        this.employerData.city = data.locality
        this.employerData.state = data.administrative_area_level_1
        this.employerData.postalCode = data.postal_code
        this.employerData.latitude = data.latitude
        this.employerData.longitude = data.longitude
      }
    },
    noGoogleStreetAddress: function (data) {
      if (data) {
        this.employerData.name = data.name
        this.employerData.street1 = ''
        this.employerData.city = ''
        this.employerData.state = ''
        this.employerData.postalCode = ''
        this.employerData.latitude = ''
        this.employerData.longitude = ''
      }
    },
    addEmployerSkillDetail: function (skillDetailId) {
      let self = this
      self.$store.commit('expertHistory/addSkillDetailProcessing', {skillDetailId})
      self.$store.dispatch('expertHistory/addMyEmployerSkillDetail', {employerId: self.employerData.id, skillDetailId: skillDetailId})
        .then(() => {
          self.$store.commit('expertHistory/deleteSkillDetailProcessing', {skillDetailId})
        })
        .catch((error) => {
          console.error(error)
        })
    },
    deleteEmployerSkillDetail: function (skillDetailId) {
      let self = this
      self.$store.commit('expertHistory/addSkillDetailProcessing', {skillDetailId})
      self.$store.dispatch('expertHistory/deleteMyEmployerSkillDetail', {employerId: self.employerData.id, skillDetailId: skillDetailId})
        .then(() => {
          self.$store.commit('expertHistory/deleteSkillDetailProcessing', {skillDetailId})
        })
        .catch((error) => {
          console.error(error)
        })
    },
    updateStartDate: function (startDate) {
      this.employerData.startYYYYMM = startDate
    },
    updateEndDate: function (endDate) {
      this.employerData.endYYYYMM = endDate
    }
  },
  watch: {
    vgaHolder: function (newData, oldData) {
      if (newData.trim() && newData !== oldData) {
        this.$refs.googleautocompleteRefSte03_01.update(' ')
      }
    }
  },
  mounted () {
    this.form_1_loading = true
    // make sure we have the data for this step
    let self = this
    let promises = []
    promises.push(self.$store.dispatch('vars/initData'))
    promises.push(self.$store.dispatch('expertHistory/initMyData'))

    Promise.all(promises)
      .catch((error) => {
        console.error(error)
      })
      .finally(() => {
        self.form_1_loading = false
      })
  }
}
</script>

<style>
   .btnLower {
     text-transform: none;
   }
   .date-picker-title {
     line-height: 1.1 !important;
   }
</style>
