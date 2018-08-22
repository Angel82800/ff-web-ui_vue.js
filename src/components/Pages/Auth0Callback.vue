<template>
  <div>
    <big-logo/>
    <br>
    <v-progress-circular indeterminate :size="50" color="primary"></v-progress-circular>
  </div>
</template>

<script>
import auth0 from '@/apis/auth0'
import BigLogo from '@/components/Parts/Decoration/BigLogo'
export default {
  name: 'callback',
  components: {
    bigLogo: BigLogo
  },
  created: function () {
    let nextRoute = 'who-are-you'
    let self = this
    auth0.webAuthDefault.parseHash((err, authResult) => {
      if (authResult && authResult.accessToken && authResult.idToken) {
        self.$store.dispatch('auth/setSession', authResult)
        switch (true) {
          case (self.$store.getters['auth/hasGroup']('Super Admin')):
            nextRoute = 'super'
            break
          case (self.$store.getters['auth/hasGroup']('Company Admin')):
            nextRoute = 'company'
            break
          case (self.$store.getters['auth/hasGroup']('Expert')):
            nextRoute = 'expert'
            break
        }
        // on a sign-up, we may know what kind of user they are, in which case we can process that rather than sending to who-are-you

        if (nextRoute === 'who-are-you' && typeof this.$route.query.state !== 'undefined' && this.$route.query.state) {
          if (self.$route.query.state === 'Expert' || self.$route.query.state === 'CompanyAdmin') { // had to strip out spaces for auth0 to recognize the callback
            self.$store.dispatch('auth/updateMyGroup', { groupId: self.$route.query.state === 'CompanyAdmin' ? 'Company Admin' : this.$route.query.state })
              .then(function (result) {
                self.$router.replace({ name: self.$route.query.state === 'Expert' ? 'expert-onboard' : 'company-onboarding' })
              })
              .catch(function (error) {
                // set alert
                self.$store.dispatch('alerts/publish', {text: `Your request was not processed fully.\n Please try again or contact support.`})
                console.error(error)
              })
          }
        } else {
          self.$router.replace({ name: nextRoute })
        }
      } else if (err) {
        self.$router.replace('error')
        console.log(err)
        // alert(`Error: ${err.error}. Check the console for further details.`)
      }
    })
  },
  data () {
    return {}
  }
}
</script>
