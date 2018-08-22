<template>
  <div class="hello">
    <big-logo :width="imageWidth" />
    <v-container>
      <v-layout wrap>
        <v-flex xs12>
          <h1>New to FactoryFix?</h1>
          <h2>Sign up as a:</h2>
          <v-container grid-list-lg>
            <v-layout wrap>
              <v-flex xs12 md6 class="text-xs-center text-md-right">
                <v-btn outline :disabled="disabled" large color="success" @click="signup(authGroups[1].id)">{{ authGroups[1].description }}</v-btn>
              </v-flex>
              <v-flex xs12 md6 class="text-xs-center text-md-left">
                <v-btn outline :disabled="disabled" large color="success" @click="signup(authGroups[0].id)">{{ authGroups[0].description }}</v-btn>
              </v-flex>
            </v-layout>
          </v-container>
          <v-progress-circular v-if="disabled" indeterminate :size="50" color="primary"></v-progress-circular>
        </v-flex>
        <v-flex xs12 class="mt-4">
          <h2>Already have an account?<br><v-btn flat color="primary" @click="login" style="text-decoration: underline">Welcome back!</v-btn></h2>
        </v-flex>
      </v-layout>
    </v-container>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import auth0 from '@/apis/auth0'
import BigLogo from '@/components/Parts/Decoration/BigLogo'
export default {
  name: 'HelloWorld',
  components: {
    bigLogo: BigLogo
  },
  data () {
    return {
      disabled: false
    }
  },
  computed: {
    imageWidth () {
      switch (this.$vuetify.breakpoint.name) {
        case 'xs':
        case 'sm':
        case 'md':
        case 'lg':
        case 'xl': return '175px'
      }
    },
    ...mapState('vars', ['authGroups'])
  },
  methods: {
    login: auth0.login,
    signup: function (which) {
      auth0.signup(which.replace(' ', '')) // remove spaces from state as it will interfere with auth0 callback recognition
    }
  },
  mounted () {
    let self = this
    let nextRoute = 'who-are-you'
    // if a user is logged in, take them to their own home page
    if (self.$store.getters['auth/isAuthenticated']) {
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
      self.$router.replace({ name: nextRoute })
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h1, h2 {
  font-weight: normal;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
