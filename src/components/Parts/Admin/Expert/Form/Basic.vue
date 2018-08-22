<template>
  <div class="text-sm-left">
    <transition name="fade" mode="out-in">
      <v-form v-model="form1Valid" v-on:submit.prevent="form1Save" v-if="step===1" key="1">
        <v-card flat>
          <v-card-actions>
            <v-btn color="primary" @click.native="goBack()" class="mb-4"><v-icon left>arrow_back</v-icon>Expert review</v-btn>
            <v-spacer></v-spacer>
            <p class="title hidden-xs-only">
              Basic Info
            </p>
            <v-spacer class="hidden-xs-only"></v-spacer>
            <v-btn type="submit" :loading="form1Loading" :disabled="!formIsValid || form1Loading" color="primary">Photo<v-icon right dark class="hidden-xs-only">arrow_forward</v-icon></v-btn>
          </v-card-actions>
          <v-card-text>

            <p class="title hidden-sm-and-up">
              Basic Info
            </p>

            <p class="headline">
              All basic fields are required. Your personal information is used only for job matches and communications and will never be sharedd with a third part without your express consent.
            </p>

            <v-text-field :disabled="form1Loading" :rules="[formRules.required]" required name="name_first" label="First Name" type="text" v-model="profileForm.name_first"></v-text-field>
            <v-text-field :disabled="form1Loading" :rules="[formRules.required]" required name="name_last" label="Last Name" type="text" v-model="profileForm.name_last"></v-text-field>
            <v-text-field v-if="getEmail" :disabled="form1Loading" :rules="[formRules.required, formRules.email]" required  name="email" label="Email" type="text" v-model="profileForm.email"></v-text-field>
            <vuetify-google-autocomplete v-show="!validatedAddress"
              ref="googleautocompleteRef"
              label="Address lookup*"
              id="googleautocompleteId"
              append-icon="search"
              placeholder="Enter an address"
              :clearable="true"
              v-on:placechanged="googleStreetAddress"
              value=""
              :disabled="form1Loading"
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
                  <v-btn color="primary" outline @click="addressUpdate()" :disabled="form1Loading">edit</v-btn>
                  <v-btn color="primary" outline @click="addressRemove()" :disabled="form1Loading">Remove</v-btn>
                </v-card-actions>
              </v-card>
            </v-flex>
          </v-card-text>
          <v-card-actions>
            <v-btn color="primary" @click.native="goBack()" class="mb-4"><v-icon left>arrow_back</v-icon>Expert review</v-btn>
            <v-spacer></v-spacer>
            <v-btn type="submit" :loading="form1Loading" :disabled="!formIsValid || form1Loading" color="primary">Photo<v-icon right dark class="hidden-xs-only">arrow_forward</v-icon></v-btn>
          </v-card-actions>
        </v-card>
      </v-form>
      <v-form v-if="step === 2" key="2">
        <v-card flat>
          <v-card-actions>
            <v-btn :disabled="form2Loading || showPhotoEditor" @click="setStep(1)" color="primary"><v-icon left dark class="hidden-xs-only">arrow_back</v-icon>Personal info</v-btn>
            <v-spacer></v-spacer>
            <p class="title hidden-xs-only">
              Basic Info ({{ step }} of 2)
            </p>
            <v-spacer class="hidden-xs-only"></v-spacer>
            <v-btn :disabled="form2Loading || showPhotoEditor" @click="goBack()" color="primary">Review<v-icon right dark class="hidden-xs-only">arrow_forward</v-icon></v-btn>
          </v-card-actions>
          <v-container grid-list-md>
            <v-layout row wrap>
              <v-flex xs12 class="text-xs-center">

                <p class="title hidden-sm-and-up">
                  Basic Info ({{ step }} of 2)
                </p>

                <p class="headline" color="primary">
                  Profiles that include images are more likely to land gigs.
                </p>
                <v-avatar v-show="!showPhotoEditor" tile size="128px" class="grey mt-3 mb-3" key="1">
                  <v-icon size="128px" dark v-show="avatar === 'icon'">account_circle</v-icon>
                  <img v-show="avatar === 'avatar'" :src="profileForm.auth0_avatar" alt="avatar">
                  <img v-show="avatar === 'photo'" :src="expertForm.photo_url" alt="avatar">
                </v-avatar>
                <croppa class="mb-3 mt-3" v-show="showPhotoEditor" v-model="photoEditor" :show-remove-button="false" :placeholder-font-size="15" :disable-click-to-choose="true" :quality="1" :width="128" :height="128" :prevent-white-space="true" :placeholder="'Choose an image'" :loading-color="$vuetify.theme.primary" key="2">
                  <v-progress-circular v-if="form2Loading" :size="128" color="grey" :indeterminate="true" class="photoSpinner"></v-progress-circular>
                </croppa>
              </v-flex>
              <v-flex xs12>
                <v-btn :disabled="form2Loading" v-show="showPhotoEditor" color="primary" outline @click.stop="photoEditorClear()">
                  Cancel
                  <v-icon right dark>cancel</v-icon>
                </v-btn>
                <v-btn :disabled="form2Loading" v-show="avatar !== 'icon' && !showPhotoEditor" color="primary" outline @click="photoRemove()">
                  Remove
                  <v-icon right dark>delete</v-icon>
                </v-btn>
                <v-btn :disabled="form2Loading" color="primary" outline @click.stop="photoFromFileSystem()">
                  New photo
                  <v-icon right dark>photo_library</v-icon>
                </v-btn>
                <v-btn :disabled="form2Loading" v-show="showPhotoEditor" color="primary" outline @click.stop="photoSave()">
                  Save
                  <v-icon right dark>save</v-icon>
                </v-btn>
              </v-flex>
            </v-layout>
          </v-container>
          <v-card-actions>
            <v-btn :disabled="form2Loading || showPhotoEditor" @click="setStep(1)" color="primary"><v-icon left dark class="hidden-xs-only">arrow_back</v-icon>Personal info</v-btn>
            <v-spacer></v-spacer>
            <v-btn :disabled="form2Loading || showPhotoEditor" @click="goBack()" color="primary">Review<v-icon right dark class="hidden-xs-only">arrow_forward</v-icon></v-btn>
          </v-card-actions>
        </v-card>
      </v-form>
    </transition>
  </div>
</template>

<script>
import {mapState, mapGetters} from 'vuex'

export default {
  props: ['expertForm', 'profileForm'],
  data () {
    return {
      step: 0,
      formRules: this.$store.state.vars.formRules,
      form1Valid: true,
      validatedAddress: '',
      googleAutocompleteEntry: 'test',
      form1Loading: false,
      form2Loading: false,
      photoEditor: {},
      showPhotoEditor: false
    }
  },
  computed: {
    formIsValid: function () {
      return (this.form1Valid && this.validatedAddress.hasOwnProperty('postalCode'))
    },
    mapUrl: function () {
      let coords = `${this.validatedAddress.latitude},${this.validatedAddress.longitude}`
      let markers = encodeURIComponent(`color:0x${this.$store.state.vars.colors.baseGreen}|${coords}`)
      return `https://maps.googleapis.com/maps/api/staticmap?center=${coords}&size=600x200&markers=${markers}&key=${this.$store.state.vars.googlePlacesKey}`
    },
    avatar: function () {
      if (this.expertForm.photo_url !== 'none') {
        if (this.expertForm.photo_url) {
          return 'photo'
        }
        if (this.profileForm.auth0_avatar) {
          return 'avatar'
        }
      }
      return 'icon'
    },
    photoEditorInitialImage: function () {
      switch (this.avatar) {
        case 'photo':
          return this.expertForm.photo_url
        case 'avatar':
          return this.profileForm.auth0_avatar
      }
      return '/static/img/mugshot-blank.png'
    },
    photoUploaded: function () {
      return (typeof this.photoEditor.hasImage === 'function' && this.photoEditor.hasImage())
    },
    getEmail: function () {
      if (this.profileForm.auth0_sub_id) {
        // if this is a social profie, we may need an email address added. If it is an Auth0 username/pwd profile, we have their email address ... somewhere
        return this.profileForm.auth0_sub_id.split('|')[0].indexOf('auth0') === -1
      }
      return false
    },
    ...mapState('userProfile', ['users']),
    ...mapState('expert', ['edit']),
    ...mapGetters('userProfile', ['getUserById'])
  },
  methods: {
    form1Save: function () {
      let self = this
      let promises = []
      this.form1Loading = true
      promises.push(this.$store.dispatch('userProfile/updateProfile', {userProfile: this.profileForm}))
      promises.push(this.$store.dispatch('expert/updateExpert', {expert: this.expertForm}))
      Promise.all(promises)
        .then(() => {
          self.$emit('refresh', ['profile', 'expert'])
          this.setStep(2)
          this.form1Loading = false
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
          this.form1Loading = false
        })
    },
    setStep: function (newStep) {
      this.step = newStep
    },
    goBack: function () {
      this.$emit('setView', 'review')
    },
    googleStreetAddress: function (data) {
      if (data) {
        // gets update from vuetify-google-autocomplete component
        this.expertForm.street1 = `${data.street_number} ${data.route}`
        this.expertForm.city = data.locality
        this.expertForm.state = data.administrative_area_level_1
        this.expertForm.postalCode = data.postal_code
        this.expertForm.latitude = data.latitude
        this.expertForm.longitude = data.longitude

        this.setValidatedAddress()
        this.googleAutocompleteEntry = ''

        this.$refs.googleautocompleteRef.clear()
      }
    },
    setValidatedAddress: function () {
      this.validatedAddress = {}
      this.validatedAddress.street1 = this.expertForm.street1
      this.validatedAddress.city = this.expertForm.city
      this.validatedAddress.state = this.expertForm.state
      this.validatedAddress.postalCode = this.expertForm.postalCode
      this.validatedAddress.latitude = this.expertForm.latitude
      this.validatedAddress.longitude = this.expertForm.longitude
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
    photoRemove: function () {
      let self = this
      let promises = []
      this.form2Loading = true
      if (this.avatar === 'photo') {
        promises.push(this.$store.dispatch('expert/removeExpertPhoto', {userProfileId: this.expertForm.userProfileId, expert: this.expertForm}))
      } else {
        this.expertForm.photo_url = 'none'
        promises.push(this.$store.dispatch('expert/updateExpert', {expert: this.expertForm}))
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
          this.showPhotoEditor = this.form2Loading = false
        })
    },
    photoSave: function () {
      this.form2Loading = true
      let self = this
      let promises = []
      let photo = this.photoEditor.generateDataUrl('jpg', 0.7).split('base64,')[1]
      // this.expertForm.photo_url = this.photoEditor.generateDataUrl('jpg', 0.8)
      promises.push(this.$store.dispatch('expert/updateExpertPhoto', {photo, expert: self.expertForm, auth0SubId: this.profileForm.auth0_sub_id}))
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
          this.showPhotoEditor = this.form2Loading = false
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
    this.step = 1
    if (this.expertForm.locationId) {
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
