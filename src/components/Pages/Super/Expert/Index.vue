<template>
  <div class="text-sm-left">
    <v-card-actions v-if="view === 'review'">
      <v-btn color="primary" @click.native="$router.go(-1)" class="mb-4"><v-icon left>arrow_back</v-icon>Back to search results</v-btn>
    </v-card-actions>
    <transition name="fade" mode="out-in">
      <review-container v-if="view === 'review'" :loadFail="loadFail" :profileForm="profileForm" :expertForm="expertForm" @networkError="handleNetworkError" @refresh="refresh" @setView="setView"></review-container>
      <form-basic v-if="view === 'form-basic'" :profileForm="profileForm" :expertForm="expertForm" @networkError="handleNetworkError" @refresh="refresh" @setView="setView"></form-basic>
      <form-expertise v-if="view === 'form-expertise'" :userProfileId="profileForm.id" @refresh="refresh" @networkError="handleNetworkError" @setView="setView"></form-expertise>
      <form-history v-if="view === 'form-history'" :userProfileId="profileForm.id" @networkError="handleNetworkError" @setView="setView"></form-history>
      <form-availability v-if="view === 'form-availability'" :expertForm="expertForm" @networkError="handleNetworkError" @refresh="refresh" @setView="setView"></form-availability>
    </transition>
  </div>
</template>

<script>
import {mapState, mapGetters} from 'vuex'
import reviewContainer from '@/components/Parts/Admin/Expert/Review/Container'
import formBasic from '@/components/Parts/Admin/Expert/Form/Basic'
import formExpertise from '@/components/Parts/Admin/Expert/Form/Expertise'
import formHistory from '@/components/Parts/Admin/Expert/Form/History'
import formAvailability from '@/components/Parts/Admin/Expert/Form/Availability'

const deact = (obj) => {
  // TODO: determine if this is actually working
  let flat = Array.isArray(obj) ? [] : {}
  if (typeof obj === 'object') {
    try {
      flat = Object.assign({}, obj)
      delete flat['__ob__']
    } catch (e) {
      throw e
    }
  }
  return flat
}
export default {
  components: {
    reviewContainer,
    formBasic,
    formExpertise,
    formHistory,
    formAvailability
  },
  data () {
    return {
      view: 'review',
      profileForm: false,
      expertForm: false,
      loadFail: false
    }
  },
  computed: {
    userProfileId: function () {
      return this.$route.params && this.$route.params.userProfileId ? this.$route.params.userProfileId : ''
    },
    ...mapState('userProfile', ['users']),
    ...mapState('expert', ['edit']),
    ...mapGetters('userProfile', ['getUserById'])
  },
  methods: {
    handleNetworkError (error) {
      let self = this
      let status = (error && error.hasOwnProperty('response') && error.response && error.response.hasOwnProperty('status')) ? error.response.status : error.message
      switch (status) {
        case 401:
          // TODO: use alert
          self.$store.dispatch('auth/logout')
          self.$router.replace({name: 'home'})
          return true
        case 'Network Error':
          // TODO: use alert
          console.log('alert', error)
          return false
      }
    },
    setView (newView) {
      this.view = newView
    },
    refresh: function (which) {
      let self = this
      switch (true) {
        case which.indexOf('profile') > -1:
          self.profileForm = deact(self.getUserById(self.userProfileId))
          // falls through
        case which.indexOf('expert') > -1:
          self.expertForm = deact(self.edit)
          // falls through
      }
    }
  },
  mounted () {
    let self = this
    console.log('about to get user profile with id', self.userProfileId)
    if (self.userProfileId) {
      let usersPromise = new Promise((resolve, reject) => {
        // make sure we have users in case of refresh
        if (self.users.length) {
          resolve()
        } else {
          self.$store.dispatch('userProfile/getUsers', {query: {}}) // get everything
            .then(() => {
              resolve()
            })
            .catch((error) => {
              reject(error)
            })
        }
      })
      usersPromise
        .then(() => {
          let promises = []
          Object.assign({}, this.$store.state.userProfile.mine)
          self.profileForm = deact(self.getUserById(self.userProfileId))
          if (!self.profileForm) {
            let query = {id: self.userProfileId}
            promises.push(self.$store.dispatch('userProfile/getUsers', {query}))
          }
          promises.push(self.$store.dispatch('expert/getExpert', {userProfileId: self.userProfileId}))
          promises.push(self.$store.dispatch('expertSkills/initEditData', {userProfileId: self.userProfileId}))
          promises.push(self.$store.dispatch('expertIndustries/initEditData', {userProfileId: self.userProfileId}))
          Promise.all(promises)
            .then(() => {
              self.profileForm = deact(self.getUserById(self.userProfileId))
              if (!self.profileForm) {
                self.loadFail = true
              } else {
                self.$store.commit('userProfile/setEdit', {profile: self.profileForm})
                self.expertForm = deact(self.edit)
                if (!self.expertForm) {
                  self.loadFail = true
                }
              }
            })
            .catch((error) => {
              self.handleNetworkError(error)
              self.loadFail = true
            })
        })
        .catch((error) => {
          self.handleNetworkError(error)
          self.loadFail = true
        })
    } else {
      self.loadFail = true
    }
  }
}
</script>

<style>
.pointer {
  cursor: pointer;
}
</style>
