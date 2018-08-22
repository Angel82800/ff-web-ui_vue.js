<template>
    <v-layout row wrap>
      <v-flex xs12 class="text-xs-center">
        <v-avatar v-show="!showPhotoEditor" tile size="128px" class="grey" key="1">
          <v-icon size="128px" dark v-show="avatar === 'icon'">account_circle</v-icon>
          <img v-show="avatar === 'avatar'" :src="profile.auth0_avatar" alt="avatar">
          <img v-show="avatar === 'photo'" :src="expert.photo_url" alt="avatar">
        </v-avatar>
        <croppa v-show="showPhotoEditor" v-model="photoEditor" :show-remove-button="false" :placeholder-font-size="15" :disable-click-to-choose="true" :quality="1" :width="128" :height="128" :prevent-white-space="true" :placeholder="'Choose an image'" :loading-color="colorPrimary">
          <v-progress-circular v-if="formLoading" :size="128" color="grey" :indeterminate="true" class="photoSpinner"></v-progress-circular>
        </croppa>
      </v-flex>
      <v-flex xs12 class="text-xs-center">
        <v-btn :disabled="formLoading" v-show="showPhotoEditor" color="primary" outline @click.stop="photoEditorClear()">
          Cancel
          <v-icon right dark>cancel</v-icon>
        </v-btn>
        <v-btn :disabled="formLoading" v-show="avatar !== 'icon' && !showPhotoEditor" color="primary" outline @click="photoRemove()">
          Remove
          <v-icon right dark>delete</v-icon>
        </v-btn>
        <v-btn :disabled="formLoading" color="primary" outline @click.stop="photoFromFileSystem()">
          New photo
          <v-icon right dark>photo_library</v-icon>
        </v-btn>
        <v-btn :disabled="formLoading" v-show="showPhotoEditor" color="primary" outline @click.stop="photoSave()">
          Save
          <v-icon right dark>save</v-icon>
        </v-btn>
      </v-flex>
    </v-layout>
</template>

<script>
export default {
  props: ['profile', 'expert'],
  data () {
    return {
      photoEditor: {},
      showPhotoEditor: false,
      formLoading: false
    }
  },
  computed: {
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
    colorPrimary: function () {
      return this.$vuetify.theme.primary
    }
  },
  methods: {
    photoRemove: function () {
      let self = this
      let promises = []
      this.formLoading = true
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
          this.showPhotoEditor = this.formLoading = false
        })
    },
    photoSave: function () {
      this.formLoading = true
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
          this.showPhotoEditor = this.formLoading = false
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
