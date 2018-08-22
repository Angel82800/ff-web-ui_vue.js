<template>
  <v-container fluid fill-height>
    <v-layout align-center justify-center>
      <v-flex xs12 lg9>
        <v-card flat class="elevation-1">
          <v-card v-if="step === 0">
            <v-card-title>
              Loading data
            </v-card-title>
            <v-progress-circular indeterminate :size="50" color="primary"></v-progress-circular>
          </v-card>
          <v-stepper v-if="step > 0" alt-labels value="1" v-model="step" class="elevation-0">
            <v-stepper-header class="fatStepper">
              <v-stepper-step step="1" :editable="false">Experience</v-stepper-step>
              <v-divider></v-divider>
              <v-stepper-step step="2" :editable="false">Skills</v-stepper-step>
              <v-divider></v-divider>
              <v-stepper-step step="3" :editable="false">Personal Info</v-stepper-step>
            </v-stepper-header>
            <v-stepper-items>
              <v-stepper-content step="1">
                <experience :categoryForm="categoryForm" :formLoading="formLoading" @process="procCategory" :pageTitle="'Which category best describes your experience?'" />
              </v-stepper-content>
              <v-stepper-content step="2">
                <skills :categoryForm="categoryForm" :skillsForm="skillsForm" :formLoading="formLoading" :formValid="skillsFormValid" @process="procSkills" :pageTitle="'What skills have you worked on?'" />
              </v-stepper-content>
              <v-stepper-content step="3">
                <personal-info :profileForm="profileForm" :expertForm="expertForm" :formLoading="formLoading" @process="procPersonalInfo" :pageTitle="'Tell us a little bit more about yourself'"/>
              </v-stepper-content>
            </v-stepper-items>
          </v-stepper>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import {mapState, mapGetters} from 'vuex'
export default {
  components: {
    experience: () => import('@/components/Parts/SkilledPro/FormCategories'),
    skills: () => import('@/components/Parts/SkilledPro/FormSkills'),
    personalInfo: () => import('@/components/Parts/SkilledPro/FormPersonalInfo')
  },
  data: () => ({
    step: 1,
    formLoading: false,
    profileForm: {},
    expertForm: {},
    categoryForm: 0,
    skillsForm: []
  }),
  computed: {
    skillsFormValid () {
      if (this.skillsForm) {
        for (let i = 0; i < this.skillsForm.length; i++) {
          if (parseInt(this.skillsForm[i].level) > 0) {
            return true
          }
        }
      }
      return false
    },
    ...mapState('expertSkills', ['categories']),
    ...mapGetters('vars', ['skillsByCategoryId']),
    ...mapGetters('expertSkills', ['skillLevel'])
  },
  methods: {
    handleNetworkError (error) {
      let self = this
      let status = (error && error.hasOwnProperty('response') && error.response && error.response.hasOwnProperty('status')) ? error.response.status : error.message
      switch (status) {
        case 401:
          self.$store.dispatch('auth/logout')
          self.$router.replace({name: 'home'})
          break
        case 'Network Error':
          console.log('alert', error)
          break
      }
    },
    navigate (where) {
      if (isNaN(where)) {
        if (where === 'back') {
          this.step--
        } else {
          if (this.step === 3) {
            // time to mosey on back to the main expert page, cowboy!
            this.$router.push({name: 'expert'})
          } else {
            this.step++
          }
        }
      } else {
        this.step = parseInt(where)
      }
    },
    procCategory (data) {
      let self = this
      self.formLoading = true
      self.$store.dispatch('expertSkills/replaceMyCategories', {categories: [data.newCategory]})
        .then((change) => {
          if (change) {
            self.categoryForm = data.newCategory
            self.prepSkills()
          }
          self.navigate(data.direction)
        })
        .catch((error) => {
          self.handleNetworkError(error)
        })
        .finally(() => {
          self.formLoading = false
        })
    },
    prepSkills () {
      this.skillsForm = []
      this.skillsByCategoryId({categoryId: this.categoryForm}).forEach((skill) => {
        this.skillsForm.push({
          skill_id: skill.id,
          skill_category_id: skill.skill_category_id,
          title: skill.title,
          level: this.skillLevel(skill.id)
        })
      })
    },
    procSkills (data) {
      let self = this
      self.formLoading = true
      self.$store.dispatch('expertSkills/replaceMySkills', {skills: data.newSkills})
        .then((change) => {
          if (change) {
            self.prepSkills()
          }
          self.navigate(data.direction)
        })
        .catch((error) => {
          self.handleNetworkError(error)
        })
        .finally(() => {
          self.formLoading = false
        })
    },
    procPersonalInfo (data) {
      let self = this
      let promises = []
      self.formLoading = true
      self.getLatLngByZipcode(self.expertForm.postalCode) // this is here while we determine if full address or just zip code is cool.
        .then(() => {
          promises.push(self.$store.dispatch('userProfile/updateMyProfile', {userProfile: self.profileForm}))
          promises.push(self.$store.dispatch('expert/updateMyExpert', {expert: self.expertForm}))
          Promise.all(promises)
            .then(() => {
              self.navigate(data.direction)
            })
            .catch((error) => {
              self.handleNetworkError(error)
            })
            .finally(() => {
              self.formLoading = false
            })
        })
    },
    getLatLngByZipcode: function (zipcode) {
      // TODO: turn this into a mixin or something
      let self = this
      return new Promise((resolve, reject) => {
        let google = window.google
        let geocoder = new google.maps.Geocoder() // available courtesy of VGA component
        let data = {
          address: zipcode
        }
        geocoder.geocode(data, function (results, status) {
          if (status === google.maps.GeocoderStatus.OK) {
            self.expertForm.latitude = results[0].geometry.location.lat()
            self.expertForm.longitude = results[0].geometry.location.lng()
          }
          resolve()
        })
      })
    }
  },
  mounted () {
    let self = this
    let promises = []
    self.step = 0

    promises.push(self.$store.dispatch('vars/initData'))
    promises.push(self.$store.dispatch('expertSkills/initMyData'))

    Promise.all(promises)
      .then(() => {
        self.profileForm = Object.assign({}, self.$store.state.userProfile.mine)
        self.expertForm = Object.assign({}, self.$store.state.expert.mine)
        self.categoryForm = self.categories[0]
        self.prepSkills()
      })
      .catch((error) => {
        console.error(error)
      })
      .finally(() => {
        self.navigate((self.$route.params.step > 0) ? self.$route.params.step : 1)
      })

    // FB pixel
    if (window.fbq) {
      window.fbq('track', 'CompleteRegistration')
    } else {
      console.log('facebook pixel would have fired if we were in production')
    }
  }
}
</script>
<style lang="stylus">
.stepper__header.fatStepper .divider {
  margin: 47px -55px 0 !important;
}
.fatStepper .stepper__step__step {
  min-width: 48px !important;
  width: 48px !important;
  height: 48px !important;
}
.card__text {
  text-align: left !important
}
.button-bar-flex {
  display: flex !important;
  .btn {
    flex-grow: 1 !important;
  }
}
.text--left {
  text-align: left;
}
</style>
