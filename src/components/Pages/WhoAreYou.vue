<template>
  <div>
    <v-container grid-list-lg v-if="showPage">
      <v-layout wrap>
        <v-flex xs12 class="mb-3">
          <h1>Welcome to FactoryFix</h1>
          <h2>Choose an option below to get started.</h2>
        </v-flex>
        <v-flex xs12 md6>
          <v-btn block :disabled="disabled" large color="success" @click="selectGroup(groups[1].id)">{{ groups[1].description }}</v-btn>
          <!-- <div class="pa-2 mt-1 text-xs-left">
            <p>
              FactoryFix keeps you informed about what companies in your area are paying for people with your skills and experience. We’ll send you pay rate information for full-time jobs and/or projects and side-gigs.
            </p>
            <p>
              If you are interested in any of these jobs or side-gigs, you can easily apply to them right through our website.
            </p>
          </div> -->
        </v-flex>
        <v-flex xs12 md6>
          <v-btn block :disabled="disabled" large color="success" @click="selectGroup(groups[0].id)">{{ groups[0].description }}</v-btn>
        </v-flex>
        <!-- <v-flex xs12 class="mb-3">
          <h3>
            Please reach out to us at (312)313-1242 if you have any questions.
          </h3>
        </v-flex> -->
      </v-layout>
    </v-container>
    <v-progress-circular v-if="disabled || !showPage" indeterminate :size="50" color="primary"></v-progress-circular>
  </div>
</template>

<script>
import auth0 from '@/apis/auth0/index'
export default {
  data () {
    return {
      disabled: false,
      showPage: false,
      groups: []
    }
  },
  methods: {
    selectGroup (groupId) {
      let self = this
      let nextRoute
      self.disabled = true
      self.$store.dispatch('auth/updateMyGroup', { groupId })
        .then(function (result) {
          // move on to next screen based on group id
          switch (true) {
            case (self.$store.getters['auth/hasGroup']('Company Admin')):
              nextRoute = 'company-onboarding'
              break
            case (self.$store.getters['auth/hasGroup']('Expert')):
              nextRoute = 'expert-onboard'
              break
          }
          self.$router.replace({ name: nextRoute })
        })
        .catch(function (error) {
          // set alert
          self.$store.dispatch('alerts/publish', {text: `Your request was not processed fully.\n Please try again or contact support.`})
          console.error(error)
        })
        .finally(function () {
          self.disabled = false
        })
    }
  },
  created () {
    this.groups = this.$store.state.vars.authGroups
    // perhaps this is an request coming from a promotion?
    if (this.$route.params.state && (this.$route.params.state === 'Expert' || this.$route.params.state === 'CompanyAdmin')) {
      auth0.signup(this.$route.params.state)
    }
  },
  mounted () {
    let self = this
    // if a user is not logged in, take them the home page
    if (!self.$store.getters['auth/isAuthenticated']) {
      self.$router.replace({ name: 'home' })
    } else {
      self.showPage = true
    }
  }
}
</script>
