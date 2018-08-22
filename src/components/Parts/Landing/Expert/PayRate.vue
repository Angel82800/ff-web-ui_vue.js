<template>
  <div>
    <v-jumbotron
      :gradient="gradient"
      src="https://cdn2.hubspot.net/hubfs/4346485/sw.jpg"
      height="100%">
      <v-container class="landingPage">
        <v-layout row wrap class="pb-5">
          <v-flex xs12>
            <div class="ma-5 text-xs-left">
              <h1 :class="headingClass + ' mb-4'">
                Are you getting <span class="primary--text text--darken-1">paid</span> what you are worth?
              </h1>
              <p :class="explainerClass + ' grey--text text--darken-2'">
                Even with today's skills gap, a lot of manufacturers are underpaying their talent. We keep you up to date with market data and show you what companies in your area are paying someone with your unique skills and brand expertise.
              </p>

              <v-btn @click="signup" class="mb-4 mx-5" large color="primary">Create profile</v-btn>

              <h2 class="display-1 mb-2 grey--text text--darken-2">Create a free profile on FactoryFix</h2>

              <div v-for="(line, index) in lines" :key="index" class="title grey--text text--darken-2 mb-2 clearBoth">
                <v-avatar class="floatLeft size32 mb-4 ml-1 mr-3 primary white--text">{{ index + 1 }}</v-avatar>
                <div :class="bulletText" v-html="line"></div>
              </div>
            </div>
          </v-flex>
        </v-layout>
      </v-container>
    </v-jumbotron>
    <big-logo color="gray" />
  </div>
</template>

<script>
import auth0 from '@/apis/auth0'
import BigLogo from '@/components/Parts/Decoration/BigLogo'
export default {
  components: {
    bigLogo: BigLogo
  },
  methods: {
    signup: function () {
      auth0.signup('Expert')
    }
  },
  data: () => ({
    lines: [
      'Find out what someone with your skills should be paid',
      'Get notified about what other companies are paying',
      'Find new jobs or side-gigs when you are available'
    ]
  }),
  computed: {
    gradient () {
      switch (this.$vuetify.breakpoint.name) {
        case 'xs':
          return 'to bottom right, rgba(255, 255, 255, 1) 0px, rgba(255, 255, 255, .9) 50%, rgba(255, 255, 255, .6)'
        case 'sm':
        case 'md':
        case 'lg':
        case 'xl':
          return 'to bottom right, rgba(255, 255, 255, 1) 0px, rgba(255, 255, 255, .95) 30%, rgba(255, 255, 255, .6)'
      }
    },
    headingClass () {
      return this.$vuetify.breakpoint.name === 'xs' ? 'display-1' : 'display-3'
    },
    explainerClass () {
      return this.$vuetify.breakpoint.name === 'xs' ? 'title' : 'headline'
    },
    bulletText () {
      return this.$vuetify.breakpoint.name === 'xs' ? '' : 'pt-2'
    }
  }
}
</script>

<style>
  .landingPage {
    padding: 0px!important;
    margin: 0px auto!important;
    max-width: 950px!important;
  }
  div.content--wrap {
    background-color: rgb(250, 250, 250);
  }
  h1.display-3 {
    line-height: 1.1!important;
  }
  p.headline, p.title {
    font-style: italic;
  }
  p.title {
    line-height: 1.2!important;
  }
  .floatLeft {
    float: left;
  }
  .clearBoth {
    clear: both;
  }
  .size32 {
    width: 32px!important;
    height: 32px!important;
  }
</style>
