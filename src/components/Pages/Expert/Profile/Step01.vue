<template>
  <div>
    <transition name="fade" mode="out-in">
      <v-form v-if="step === 1" key="1" v-model="form_1_valid" v-on:submit.prevent="form_1_save(2)">
        <v-card flat>
          <v-card-actions>
            <v-btn :loading="form_1_loading" :disabled="form_1_loading" @click="form_1_save(0)" color="primary"><v-icon left dark>arrow_back</v-icon><span class="hidden-xs-only">Exit</span></v-btn>
            <v-spacer></v-spacer>
            <p class="title hidden-xs-only">
              Basic Info<!--  ({{ step }} of 2) -->
            </p>
            <v-spacer class="hidden-xs-only"></v-spacer>
            <v-btn type="submit" :loading="form_1_loading" :disabled="!formIsValid || form_1_loading" color="primary"><span class="hidden-xs-only">Step 2</span><v-icon right dark>arrow_forward</v-icon></v-btn>
          </v-card-actions>
          <v-card-text>

            <p class="title hidden-sm-and-up">
              Basic Info<!--  ({{ step }} of 2) -->
            </p>

            <!-- <p class="headline">
              All basic fields are required. Your personal information is used only for job matches and communications and will never be shared with a third part without your express consent.
            </p> -->

            <v-text-field :disabled="form_1_loading" :rules="[formRules.required]" required name="name_first" label="First Name" type="text" v-model="profile.name_first"></v-text-field>
            <v-text-field :disabled="form_1_loading" :rules="[formRules.required]" required name="name_last" label="Last Name" type="text" v-model="profile.name_last"></v-text-field>
            <v-text-field v-if="getEmail" :disabled="form_1_loading" :rules="[formRules.required, formRules.email]" required  name="email" label="Email" type="text" v-model="profile.email"></v-text-field>
            <v-text-field :disabled="form_1_loading" :rules="[formRules.required]" required name="phone" label="Phone Number" type="text" v-model="expert.phone"></v-text-field>
            <template v-if="expert.locationId && validatedAddress.street1"> <!-- a little hack while we determine if zip code is enough info to gather -->
              <vuetify-google-autocomplete v-show="!validatedAddress"
                ref="googleautocompleteRef"
                label="Address lookup*"
                id="googleautocompleteId"
                append-icon="search"
                placeholder="Enter an address"
                :clearable="true"
                v-on:placechanged="googleStreetAddress"
                value=""
                :disabled="form_1_loading"
                googleApiKey
              >
              </vuetify-google-autocomplete>
              <v-flex xs12 sm6 v-show="validatedAddress">
                <v-card color="green lighten-5">
                  <v-card-media :src="mapUrl" height="200px"></v-card-media>
                  <v-card-text>
                    <div style="text-align: left; font-size: 1.2em;">
                      {{ validatedAddress.street1 }}<br>
                      {{ validatedAddress.city }}, {{ validatedAddress.state }} {{ validatedAddress.postalCode }}
                    </div>
                  </v-card-text>
                  <v-card-actions>
                    <v-spacer />
                    <v-btn color="primary" outline @click="addressUpdate()" :disabled="form_1_loading">edit</v-btn>
                    <v-btn color="primary" outline @click="addressRemove()" :disabled="form_1_loading">Remove</v-btn>
                  </v-card-actions>
                </v-card>
              </v-flex>
            </template>
            <v-text-field v-else :disabled="form_1_loading" :rules="[formRules.required]" required name="postalCode" label="Zip Code" type="text" v-model="expert.postalCode"></v-text-field>
          </v-card-text>
          <v-card-actions>
            <v-btn :loading="form_1_loading" :disabled="form_1_loading" @click="form_1_save(0)" color="primary"><v-icon left dark>arrow_back</v-icon><span class="hidden-xs-only">Exit</span></v-btn>
            <v-spacer></v-spacer>
            <v-btn type="submit" :loading="form_1_loading" :disabled="!formIsValid || form_1_loading" color="primary"><span class="hidden-xs-only">Step 2</span><v-icon right dark>arrow_forward</v-icon></v-btn>
          </v-card-actions>
        </v-card>
      </v-form>
      <v-form v-if="step === 2" key="2">
        <v-card flat>
          <v-card-actions>
            <v-btn :disabled="form_2_loading || showPhotoEditor" @click="setStep(1)" color="primary"><v-icon left dark>arrow_back</v-icon><span class="hidden-xs-only">Personal info</span></v-btn>
            <v-spacer></v-spacer>
            <p class="title hidden-xs-only">
              Basic Info ({{ step }} of 2)
            </p>
            <v-spacer class="hidden-xs-only"></v-spacer>
            <v-btn :disabled="form_2_loading || showPhotoEditor" @click="setStep(3)" color="primary"><span class="hidden-xs-only">Step 2</span><v-icon right dark>arrow_forward</v-icon></v-btn>
          </v-card-actions>
          <v-container grid-list-md>
            <v-layout row wrap>
              <v-flex xs12>

                <p class="title hidden-sm-and-up">
                  Basic Info ({{ step }} of 2)
                </p>

                <p class="headline" color="primary">
                  Profiles that include images are more likely to land gigs.
                </p>
                <v-avatar v-show="!showPhotoEditor" tile size="128px" class="grey mt-3 mb-3" key="1">
                  <v-icon size="128px" dark v-show="avatar === 'icon'">account_circle</v-icon>
                  <img v-show="avatar === 'avatar'" :src="profile.auth0_avatar" alt="avatar">
                  <img v-show="avatar === 'photo'" :src="expert.photo_url" alt="avatar">
                </v-avatar>
                <croppa class="mb-3 mt-3" v-show="showPhotoEditor" v-model="photoEditor" :show-remove-button="false" :placeholder-font-size="15" :disable-click-to-choose="true" :quality="1" :width="128" :height="128" :prevent-white-space="true" :placeholder="'Choose an image'" :loading-color="colorPrimary" key="2">
                  <v-progress-circular v-if="form_2_loading" :size="128" color="grey" :indeterminate="true" class="photoSpinner"></v-progress-circular>
                </croppa>
              </v-flex>
              <v-flex xs12>
                <v-btn :disabled="form_2_loading" v-show="showPhotoEditor" color="primary" outline @click.stop="photoEditorClear()">
                  Cancel
                  <v-icon right dark>cancel</v-icon>
                </v-btn>
                <v-btn :disabled="form_2_loading" v-show="avatar !== 'icon' && !showPhotoEditor" color="primary" outline @click="photoRemove()">
                  Remove
                  <v-icon right dark>delete</v-icon>
                </v-btn>
                <v-btn :disabled="form_2_loading" color="primary" outline @click.stop="photoFromFileSystem()">
                  New photo
                  <v-icon right dark>photo_library</v-icon>
                </v-btn>
                <v-btn :disabled="form_2_loading" v-show="showPhotoEditor" color="primary" outline @click.stop="photoSave()">
                  Save
                  <v-icon right dark>save</v-icon>
                </v-btn>
              </v-flex>
            </v-layout>
          </v-container>
          <v-card-actions>
            <v-btn :disabled="form_2_loading || showPhotoEditor" @click="setStep(1)" color="primary"><v-icon left dark>arrow_back</v-icon><span class="hidden-xs-only">Personal info</span></v-btn>
            <v-spacer></v-spacer>
            <v-btn :disabled="form_2_loading || showPhotoEditor" @click="setStep(3)" color="primary"><span class="hidden-xs-only">Step 2</span><v-icon right dark>arrow_forward</v-icon></v-btn>
          </v-card-actions>
        </v-card>
      </v-form>
    </transition>
  </div>
</template>

<script>
import { mapState } from 'vuex'
export default {
  data () {
    return {
      step: 1,
      form_1_valid: true,
      validatedAddress: '',
      googleAutocompleteEntry: 'test',
      form_1_loading: false,
      form_2_loading: false,
      photoEditor: {},
      showPhotoEditor: false
    }
  },
  props: ['profile', 'expert'],
  computed: {
    colorPrimary: function () {
      return this.$vuetify.theme.primary
    },
    formIsValid: function () {
      return (this.form_1_valid && ((this.expert.locationId && this.validatedAddress.hasOwnProperty('postalCode')) || (this.expert.postalCode)))
    },
    mapUrl: function () {
      let coords = `${this.validatedAddress.latitude},${this.validatedAddress.longitude}`
      let markers = encodeURIComponent(`color:0x${this.$store.state.vars.colors.baseGreen}|${coords}`)
      return `https://maps.googleapis.com/maps/api/staticmap?center=${coords}&size=600x200&markers=${markers}&key=${this.$store.state.vars.googlePlacesKey}`
    },
    locationId: function () {
      return this.expert.locationId
    },
    avatar: function () {
      if (this.expert.photo_url !== 'none') {
        if (this.expert.photo_url) {
          return 'photo'
        }
        if (this.profile.auth0_avatar) {
          return 'avatar'
        }
      }
      return 'icon'
    },
    // No longer used?
    // photoEditorInitialImage: function () {
    //   switch (this.avatar) {
    //     case 'photo':
    //       return this.expert.photo_url
    //     case 'avatar':
    //       return this.profile.auth0_avatar
    //   }
    //   return '/static/img/mugshot-blank.png'
    // },
    // photoUploaded: function () {
    //   return (typeof this.photoEditor.hasImage === 'function' && this.photoEditor.hasImage())
    // },
    getEmail: function () {
      if (this.profile.auth0_sub_id) {
        // if this is a social profie, we may need an email address added. If it is an Auth0 username/pwd profile, we have their email address ... somewhere
        return this.profile.auth0_sub_id.split('|')[0].indexOf('auth0') === -1
      }
      return false
    },
    ...mapState('vars', ['formRules'])
  },
  methods: {
    form_1_save: function (newStep) {
      console.log('expert onboarding step 1 saving with new step', newStep)
      let self = this
      let promises = []
      self.form_1_loading = true

      self.getLatLngByZipcode(self.expert.postalCode) // this is here while we determine if full address or just zip code is cool.
        .then(() => {
          promises.push(self.$store.dispatch('userProfile/updateMyProfile', {userProfile: self.profile}))
          promises.push(self.$store.dispatch('expert/updateMyExpert', {expert: self.expert}))
          Promise.all(promises)
            .then(() => {
              self.$emit('refresh', ['profile', 'expert'])
              self.setStep(newStep)
              self.form_1_loading = false
            })
            .catch((error) => {
              let status = (error && error.hasOwnProperty('response') && error.response && error.response.hasOwnProperty('status')) ? error.response.status : error.message
              console.log(status)
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
              self.form_1_loading = false
            })
        })
    },
    setStep: function (step) {
      let self = this
      // update path based on step
      if (step === 2) {
        self.$emit('navigate', 'next')
      } else if (step === 0) {
        self.$emit('navigate', 'back')
      } else {
        this.step = step
        this.$ga.page({
          page: this.$route.path + '/1/' + this.step
        })
      }
    },
    googleStreetAddress: function (data) {
      let self = this
      if (data) {
        // gets update from vuetify-google-autocomplete component
        self.expert.street1 = `${data.street_number} ${data.route}`
        self.expert.city = data.locality
        self.expert.state = data.administrative_area_level_1
        self.expert.postalCode = data.postal_code
        self.expert.latitude = data.latitude
        self.expert.longitude = data.longitude

        self.setValidatedAddress()
        self.googleAutocompleteEntry = ''
      }
    },
    setValidatedAddress: function () {
      this.validatedAddress = {}
      this.validatedAddress.street1 = this.expert.street1
      this.validatedAddress.city = this.expert.city
      this.validatedAddress.state = this.expert.state
      this.validatedAddress.postalCode = this.expert.postalCode
      this.validatedAddress.latitude = this.expert.latitude
      this.validatedAddress.longitude = this.expert.longitude
    },
    addressUpdate: function () {
      let addressString = `${this.validatedAddress.street1} ${this.validatedAddress.city} ${this.validatedAddress.state} ${this.validatedAddress.postalCode}`
      this.$refs.googleautocompleteRef.update(addressString)
      this.validatedAddress = ''
    },
    addressRemove: function () {
      this.$refs.googleautocompleteRef.clear()
      this.validatedAddress = ''
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
            self.expert.latitude = results[0].geometry.location.lat()
            self.expert.longitude = results[0].geometry.location.lng()
          }
          resolve()
        })
      })
    },
    photoRemove: function () {
      let self = this
      let promises = []
      this.form_2_loading = true
      if (this.avatar === 'photo') {
        promises.push(this.$store.dispatch('expert/removeMyExpertPhoto'))
      } else {
        this.expert.photo_url = 'none'
        promises.push(this.$store.dispatch('expert/updateMyExpert', {expert: this.expert}))
      }
      Promise.all(promises)
        .then(() => {
          self.photoEditor.remove()
          self.$emit('refresh', ['expert'])
        })
        .catch((error) => {
          let status = (error && error.hasOwnProperty('response') && error.response && error.response.hasOwnProperty('status')) ? error.response.status : error.message
          switch (status) {
            case 401:
              this.$store.dispatch('auth/logout')
              break
            case 'Network Error':
              // TODO: use alert
              console.log('alert')
              break
          }
        })
        .finally(() => {
          this.showPhotoEditor = this.form_2_loading = false
        })
    },
    photoSave: function () {
      this.form_2_loading = true
      let self = this
      let promises = []
      let photo = this.photoEditor.generateDataUrl('jpg', 0.7).split('base64,')[1]
      // this.expert.photo_url = this.photoEditor.generateDataUrl('jpg', 0.8)
      promises.push(this.$store.dispatch('expert/updateMyExpertPhoto', {photo}))
      Promise.all(promises)
        .then(() => {
          self.$emit('refresh', ['expert'])
          // this.photoEditor = false
        })
        .catch((error) => {
          let status = (error && error.hasOwnProperty('response') && error.response && error.response.hasOwnProperty('status')) ? error.response.status : error.message
          switch (status) {
            case 401:
              this.$store.dispatch('auth/logout')
              break
            case 'Network Error':
              // TODO: use alert
              console.log('alert')
              break
          }
        })
        .finally(() => {
          this.showPhotoEditor = this.form_2_loading = false
        })
    },
    photoFromFileSystem: function () {
      this.showPhotoEditor = true
      this.photoEditor.chooseFile()
    },
    photoEditorClear: function () {
      this.showPhotoEditor = false
      this.photoEditor.remove()
    }
  },
  watch: {
    locationId: function (newId, oldId) {
      if (newId) {
        this.setValidatedAddress()
      }
    }
  },
  mounted () {
    if (this.expert.locationId) {
      this.setValidatedAddress()
    }
  }
}
</script>

<style>
  .photoSpinner {
    position: absolute !important;
    top: 50%;
    left: 50%;
    margin-top: -64px;
    margin-left: -64px;
  }
</style>
