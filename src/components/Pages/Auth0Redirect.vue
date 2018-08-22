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
  created () {
    if (typeof this.$route.query.state !== 'undefined' && this.$route.query.state) {
      if (this.$route.query.state === 'Business') {
        auth0.signup('CompanyAdmin')
      } else if (this.$route.query.state === 'SkilledPro') {
        auth0.signup('Expert')
      }
    } else {
      auth0.signup('Expert')
    }
  }
}
</script>
