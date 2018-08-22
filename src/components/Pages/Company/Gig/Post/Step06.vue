<template>
    <v-card flat>
    <stepButtons @navigate="setStep" :formLoading="form_loading" :formValid="form_valid" :backButton="backButton" :forwardButton="exitText" :top="true" :title="pageTitle" />

    <p class="title hidden-sm-and-up" v-html="pageTitle"></p>

    <p class="headline">
      Review the position and post, or save and post later.
    </p>

    <v-container fluid grid-list-xl class="pt-0 mb-5 text--left">
      <v-layout justify-center row wrap>
        <v-flex xs12 md10 lg6>
          <v-card flat>
            <v-card-actions>
              <v-btn color="primary" outline @click="exit">{{ exitText }}<v-icon right>cancel</v-icon></v-btn>
              <v-spacer></v-spacer>
              <v-btn :loading="form_loading" :disabled="!form_valid || form_loading" color="primary" outline @click="post">{{ postText }}<v-icon right>save</v-icon></v-btn>
            </v-card-actions>

            <v-container class="mt-5">
              <v-layout row wrap>
                <v-flex xs12>
                  <h1 v-if="gig.skill_category_id > 0" v-html="categoriesById({categoryIds: [gig.skill_category_id]})[0].title"></h1>
                </v-flex>
                <v-flex v-if="gig.description" xs12>
                  <h2>Details</h2>
                  <pre v-html="gig.description"></pre>
                </v-flex>
                <v-flex xs12 :md6="reviewForm.length > 1" v-for="(skill, skillIndex) in reviewForm" :key="skillIndex">
                  <v-card>
                    <v-card-text>
                      <h2 v-html="skill.title"></h2>
                      <h4 v-html="getSkillLevel(skill.id)"></h4>
                      <div v-for="(group, groupIndex) in skill.groups" :key="groupIndex">
                        <h3 v-html="group.title"></h3>
                        <p v-html="group.details.join(', ')"></p>
                      </div>
                    </v-card-text>
                  </v-card>
                </v-flex>
                <!-- <v-flex xs12>
                  <v-card>
                    <v-card-text>
                      <h2>
                        Hours and days
                      </h2>
                      <h3>
                        {{ requiredHours }}
                      </h3>
                      <h3>
                        {{ requiredDays }}
                      </h3>
                    </v-card-text>
                  </v-card>
                </v-flex>
                <v-flex xs12>
                  <v-card class="mb-4">
                    <v-card-media :src="mapUrl" height="200px"></v-card-media>
                    <v-card-text>
                      <h2>
                        {{ gig.street1 }}, {{ gig.city }}, {{ gig.state }} {{ gig.postalCode }}
                      </h2>
                    </v-card-text>
                  </v-card>
                </v-flex> -->
              </v-layout>
            </v-container>
          </v-card>
        </v-flex>
      </v-layout>
    </v-container>
    <stepButtons @navigate="setStep" :formLoading="form_loading" :formValid="form_valid" :backButton="backButton" :forwardButton="exitText" :top="false" :title="pageTitle" />
    </v-card>
</template>

<script>
import {mapState, mapGetters} from 'vuex'
import StepButtons from '@/components/Parts/StepButtons.vue'

export default {
  components: {
    stepButtons: StepButtons
  },
  props: ['gig', 'reviewForm'],
  data () {
    return {
      step: 5,
      form_loading: false,
      backButton: 'Back',
      pageTitle: 'Review and post'
    }
  },
  computed: {
    form_valid: function () {
      return true
    },
    exitText: function () {
      switch (this.gig.status) {
        case 'draft':
          return 'Save and Exit'
      }
      return 'Save and Exit!'
    },
    postText: function () {
      switch (this.gig.status) {
        case 'draft':
          return 'Post'
      }
      return 'Post'
    },
    mapUrl: function () {
      let coords = `${this.gig.latitude},${this.gig.longitude}`
      let markers = encodeURIComponent(`color:0x${this.colors.baseGreen}|${coords}`)
      return `https://maps.googleapis.com/maps/api/staticmap?center=${coords}&size=600x200&markers=${markers}&key=${this.googlePlacesKey}`
    },
    ...mapState('customerGigs', ['gigSkills']),
    ...mapState('vars', ['expertise', 'colors', 'googlePlacesKey']),
    ...mapGetters('vars', ['categoriesById']),
    ...mapGetters('customerGigs', ['detailSelected', 'requiredHours', 'requiredDays'])
  },
  methods: {
    getSkillLevel: function (skillId) {
      let self = this
      for (let i = 0; i < self.gigSkills.length; i++) {
        if (self.gigSkills[i].skill_id === skillId) {
          return self.expertise.skillLevels[self.gigSkills[i].level]
        }
      }
    },
    setStep: function (direction) {
      let self = this
      let currentStep = self.step
      let newStep
      if (isNaN(direction)) {
        newStep = (direction === 'back') ? currentStep - 1 : currentStep + 1
      } else {
        newStep = parseInt(direction)
      }
      self.$emit('navigate', newStep)
    },
    post: function () {
      // update the status
      this.setStep(parseInt(this.step) + 1)
      this.$store.dispatch(`customerGigs/publishGig`, {gigId: this.gig.id})
    },
    exit: function () {
      this.setStep(0)
    }
  }
}

</script>

<style>
v-text-field {
  display: block;
}
</style>
