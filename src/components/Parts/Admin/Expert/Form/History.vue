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

    <transition name="fade" mode="out-in">
      <div v-if="step === 1" key="1" class="text-xs-center">
        <v-btn large outline color="primary" @click="addEmployer()">Add an employer record <v-icon right>add</v-icon></v-btn>
        <v-container fluid class="pb-0">
          <v-layout justify-center>
            <v-flex xs12 md8 lg6>
              <transition-group name="fade" mode="out-in">
                <v-card v-for="employer in employers" :key="employer.id" class="elevation-4 text-xs-left mb-4">
                  <v-card-title primary-title class="py-2 primary white--text">
                    <h3 class="headline">{{ employer.name }}</h3>
                  </v-card-title>
                  <v-card-text>
                    <h3 class="mb-3">{{ employer.startYYYYMM }} &mdash; {{ employer.endYYYYMM || 'present'}}</h3>
                    <v-chip v-for="(skillDetail, index) in employerSkillDetails({employerId: employer.id})" :key="index">
                      {{skillDetailName({skillDetailId: skillDetail.expert_skill_detail_skill_detail_id})}}
                    </v-chip>
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
        <v-btn v-if="formValid" large outline color="primary" @click="addEmployer()">Add an employer record <v-icon right>add</v-icon></v-btn>
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
                  <v-form v-model="formValidEmployer" v-on:submit.prevent>
                    <v-dialog
                      ref="startYYYYMM"
                      persistent
                      v-model="startYYYYMMmodal"
                      lazy
                      full-width
                      width="290px"
                      :return-value.sync="employerData.startYYYYMM"
                    >
                      <v-text-field
                        slot="activator"
                        label="Start Date"
                        v-model="employerData.startYYYYMM"
                        :clearable="true"
                        prepend-icon="event"
                        readonly
                        required
                        :rules="[formRules.required, formRules.employmentDate, afterStartDate]"
                        :disabled="formLoading"
                      ></v-text-field>
                      <v-date-picker type="month" :max="datePickerMax" v-model="employerData.startYYYYMM" scrollable>
                        <v-spacer></v-spacer>
                        <v-btn flat color="primary" @click="startYYYYMMmodal = false">Cancel</v-btn>
                        <v-btn flat color="primary" @click="$refs.startYYYYMM.save(employerData.startYYYYMM)">OK</v-btn> <!-- -->
                      </v-date-picker>
                    </v-dialog>

                    <v-dialog
                      ref="endYYYYMM"
                      persistent
                      v-model="endYYYYMMmodal"
                      lazy
                      full-width
                      width="290px"
                      :return-value.sync="employerData.endYYYYMM"
                    >
                      <v-text-field
                        slot="activator"
                        label="End Date -- leave blank for a current position"
                        v-model="employerData.endYYYYMM"
                        :clearable="true"
                        prepend-icon="event"
                        readonly
                        required
                        :rules="[formRules.employmentDate, afterStartDate]"
                        :disabled="formLoading"
                      ></v-text-field>
                      <v-date-picker type="month" :max="datePickerMax" v-model="employerData.endYYYYMM" scrollable>
                        <v-spacer></v-spacer>
                        <v-btn flat color="primary" @click="endYYYYMMmodal = false">Cancel</v-btn>
                        <v-btn flat color="primary" @click="$refs.endYYYYMM.save(employerData.endYYYYMM)">OK</v-btn> <!-- -->
                      </v-date-picker>
                    </v-dialog>

                    <vuetify-google-autocomplete
                      ref="googleautocompleteRefStep2"
                      label="Company lookup"
                      id="googleautocompleteIdStep2"
                      append-icon="search"
                      placeholder="Enter a company name, city, state and hit enter to search"
                      :clearable="true"
                      v-on:placechanged="googleStreetAddress"
                      value=""
                      :disabled="formLoading"
                      types="establishment"
                      googleApiKey
                      v-on:no-results-found="noGoogleStreetAddress"
                      v-model="vgaHolder"
                    >
                    <!-- TODO: get better data from component and make 'required' work like other vuetify components -->
                    </vuetify-google-autocomplete>
                    <div v-show="employerData">
                      <v-text-field :disabled="formLoading" :rules="[formRules.required]" name="name" label="Company Name" type="text" v-model="employerData.name"></v-text-field>
                      <v-text-field :disabled="formLoading" :rules="[formRules.required]" required name="street1" label="Street Address" type="text" v-model="employerData.street1"></v-text-field>
                      <v-text-field :disabled="formLoading" :rules="[formRules.required]" required name="city" label="City" type="text" v-model="employerData.city"></v-text-field>
                      <v-text-field :disabled="formLoading" :rules="[formRules.required]" required name="state" label="State" type="text" v-model="employerData.state"></v-text-field>
                      <v-text-field :disabled="formLoading" :rules="[formRules.required]" required name="postalCode" label="Zip" type="text" v-model="employerData.postalCode"></v-text-field>
                    </div>
                  </v-form>
                </v-card-text>
                <v-card-actions>
                  <v-btn color="primary" flat @click="setStep(1)">Cancel<v-icon right>cancel</v-icon></v-btn>
                  <v-spacer></v-spacer>
                  <v-btn :loading="formLoading" :disabled="!formValid || formLoading" color="primary" flat @click="setStep(3)">Save<v-icon right>save</v-icon></v-btn>
                </v-card-actions>
              </v-card>
            </v-flex>
          </v-layout>
        </v-container>
      </div>
      <div v-if="step === 3" key="3" class="text-xs-center">
          <h1>Which of the expert's skills were used at this company?</h1>
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
                <v-btn :disabled="!formValid" outline color="primary" @click="setStep(1)">
                  Done adding skills
                  <v-icon right>check</v-icon>
                </v-btn>
              </v-flex>
            </v-layout>
          </v-container>
        </div>
    </transition>

    <v-card-actions class="mb-3">
      <v-btn :loading="formLoading" :disabled="formLoading" @click="setStep(parseInt(step) - 1)" color="primary"><v-icon left dark class="hidden-xs-only">arrow_back</v-icon>{{ backButton }}</v-btn>
      <v-spacer></v-spacer>
      <v-spacer class="hidden-xs-only"></v-spacer>
    </v-card-actions>
  </v-card>
</template>

<script>
import {mapGetters, mapState} from 'vuex'
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
    userProfileId: userProfileId
  }
}
export default {
  props: ['userProfileId'],
  data () {
    return {
      formLoading: false,
      step: 1,
      validatedAddress: false,
      vgaHolder: '', // so we can get the string value of the vuetify google autocomplete component
      formRules: this.$store.state.vars.formRules,
      companySearchInput: '',
      expert_employer: false,
      employerData: false, // we use this for editing an expert employer and for holding data we get back from google places
      startYYYYMMmodal: false,
      endYYYYMMmodal: false,
      pageTitle: 'Employment history',
      formValidEmployer: true
    }
  },
  computed: {
    totalSteps: function () {
      return 3
    },
    forwardButton: function () {
      switch (this.step) {
        case 1:
          return 'Skills'
        case 2:
          // it's only 'details' if the selected skills have details
          if (this.hasDetails) {
            return 'Details'
          }
          return 'Industries'
        case 3:
          return 'Industries'
        default:
          return 'Review'
      }
    },
    backButton: function () {
      switch (this.step) {
        default:
          return 'Back'
      }
    },
    formValid: function () {
      let self = this
      switch (this.step) {
        case 1:
          return self.employers.length > 0
        case 2:
          return self.formValidEmployer
        default:
          return true
      }
    },
    afterStartDate: function () {
      // this test is only necessary if an end date has been entered
      if (this.employerData.endYYYYMM === null || this.employerData.endYYYYMM.trim() === '') {
        return true
      }
      return (this.employerData.startYYYYMM < this.employerData.endYYYYMM) || 'End date must be after start date'
    },
    datePickerMax: function () {
      let d = new Date()
      return (d.getFullYear() + '-' + (d.getMonth() + 1).toString().padStart(2, '0'))
    },
    ...mapState('expertHistory', ['employers']),
    ...mapGetters('expertHistory', ['employerSkillDetails', 'employerSkillDetailProcessing']),
    ...mapGetters('vars', ['skillDetailName']),
    ...mapGetters('expertSkills', ['unusedDetails'])
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
          case (self.formValid && currentStep === 2 && newStep === 3):
            savePromise = this.saveEmployer()
            break
          // case (self.formValid && currentStep === 3):
          //   savePromise = this.saveForm3()
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
                case 1:
                  this.clearEmployerData()
                  break
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
    editEmployer: function (id) {
      let self = this
      self.employerData = newEmployerData(self.userProfileId)
      // load employer into edit form
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
      self.employerData = newEmployerData(self.userProfileId)
      // set step to 2 for transition
      self.setStep(2)
    },
    deleteEmployer: function (employerId) {
      // whack the employer in question
      let self = this
      return new Promise((resolve, reject) => {
        self.$store.dispatch('expertHistory/deleteEditEmployer', {userProfileId: self.userProfileId, employerId})
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
        self.$store.dispatch('expertHistory/replaceEditEmployer', {userProfileId: self.userProfileId, employer: self.employerData})
          .then((result) => {
            self.employerData.id = result.id
            // 2. make sure we have data for next step
            let promises = []
            promises.push(self.$store.dispatch('vars/initData'))
            promises.push(self.$store.dispatch('expertSkills/getEditSkills', {userProfileId: self.userProfileId}))
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
      this.employerData = newEmployerData(this.userProfileId)
    },
    googleStreetAddress: function (data) {
      if (data) {
        // deal with this new info
        this.employerData.name = ''
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
      self.$store.dispatch('expertHistory/addEditEmployerSkillDetail', {userProfileId: self.userProfileId, employerId: self.employerData.id, skillDetailId: skillDetailId})
        .catch((error) => {
          console.error(error)
        })
        .finally(() => {
          self.$store.commit('expertHistory/deleteSkillDetailProcessing', {skillDetailId})
        })
    },
    deleteEmployerSkillDetail: function (skillDetailId) {
      let self = this
      self.$store.commit('expertHistory/addSkillDetailProcessing', {skillDetailId})
      self.$store.dispatch('expertHistory/deleteEditEmployerSkillDetail', {userProfileId: self.userProfileId, employerId: self.employerData.id, skillDetailId: skillDetailId})
        .catch((error) => {
          console.error(error)
        })
        .finally(() => {
          self.$store.commit('expertHistory/deleteSkillDetailProcessing', {skillDetailId})
        })
    }
  },
  watch: {
    vgaHolder: function (newData, oldData) {
      if (newData.trim() && newData !== oldData) {
        this.employerData.name = newData.split(',')[0]
        this.$refs.googleautocompleteRefStep2.update(' ')
      }
    }
  },
  mounted () {
    // make sure we have the data for this step
    let self = this
    let promises = []
    self.formLoading = true
    promises.push(self.$store.dispatch('vars/initData'))
    promises.push(self.$store.dispatch('expertHistory/initEditData', {userProfileId: self.userProfileId}))

    Promise.all(promises)
      .catch((error) => {
        console.error(error)
      })
      .finally(() => {
        self.formLoading = false
      })
  }
}
</script>
