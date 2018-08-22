<template>
  <v-container fluid fill-height>
    <v-layout align-center justify-center>
      <v-flex xs12 lg9>
        <v-card flat class="elevation-12">
          <v-toolbar dark color="primary">
            <v-toolbar-title class="headline white--text">{{ ($route.params && $route.params.gigId) ? 'Edit' : 'Post' }} a Gig</v-toolbar-title>
          </v-toolbar>
          <v-card v-if="step === 0">
            <v-card-title>
              Loading data
            </v-card-title>
            <v-progress-circular indeterminate :size="50" color="primary"></v-progress-circular>
          </v-card>
          <v-stepper v-if="step > 0" alt-labels value="1" v-model="step" class="elevation-0">
            <v-stepper-header>
              <!-- <v-stepper-step step="1" :complete="step > 1" :editable="step > 1">When &amp; Where</v-stepper-step>
              <v-divider></v-divider> -->
              <v-stepper-step step="1" :complete="step > 1" :editable="step > 1">Category</v-stepper-step>
              <v-divider></v-divider>
              <v-stepper-step step="2" :complete="step > 2" :editable="step > 2">Skill</v-stepper-step>
              <v-divider></v-divider>
              <v-stepper-step step="3" :complete="step > 3" :editable="step > 3 && checkSkillDetails">Experience</v-stepper-step>
              <v-divider></v-divider>
              <v-stepper-step step="4" :complete="step > 4" :editable="step > 4">Description</v-stepper-step>
              <v-divider></v-divider>
              <v-stepper-step step="5" :complete="step > 5" :editable="step > 5">Review</v-stepper-step>
            </v-stepper-header>
            <v-stepper-items>
              <!-- <v-stepper-content step="1">
                <step-01 :gig="gigForm" @navigate="setStep" @prepare="prepare" @networkError="handleNetworkError"></step-01>
              </v-stepper-content> -->
              <v-stepper-content step="1">
                <step-02 :gig="gigForm" @navigate="setStep" @prepare="prepare" @networkError="handleNetworkError"></step-02>
              </v-stepper-content>
              <v-stepper-content step="2">
                <step-03 :gig="gigForm" :newSkills="newSkills" @navigate="setStep" @prepare="prepare" @networkError="handleNetworkError"></step-03>
              </v-stepper-content>
              <v-stepper-content step="3">
                <step-04 :newDetailForm="newDetailForm" :newDetails="newDetails" @navigate="setStep" @prepare="prepare" @networkError="handleNetworkError"></step-04>
              </v-stepper-content>
              <v-stepper-content step="4">
                <step-05 :gig="gigForm" @navigate="setStep" @prepare="prepare" @networkError="handleNetworkError"></step-05>
              </v-stepper-content>
              <v-stepper-content step="5">
                <step-06 :gig="gigForm" :reviewForm="reviewForm" @navigate="setStep" @prepare="prepare" @networkError="handleNetworkError"></step-06>
              </v-stepper-content>
            </v-stepper-items>
          </v-stepper>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import {mapState, mapGetters} from 'vuex'
// import Step01 from './Step01.vue'
import Step02 from './Step02.vue'
import Step03 from './Step03.vue'
import Step04 from './Step04.vue'
import Step05 from './Step05.vue'
import Step06 from './Step06.vue'

export default {
  components: {
    // step01: Step01,
    step02: Step02,
    step03: Step03,
    step04: Step04,
    step05: Step05,
    step06: Step06
  },
  data () {
    return {
      step: 1,
      gigForm: {},
      newSkills: [],
      newDetailForm: [],
      newDetails: [],
      reviewForm: []
    }
  },
  computed: {
    checkSkillDetails: function () {
      let self = this
      let skillIds = []
      for (let i = 0; i < self.newSkills.length; i++) {
        if (parseInt(self.newSkills[i].level) > 0) {
          skillIds.push(self.newSkills[i].skill_id)
        }
      }
      if (!skillIds.length || !self.skillsHaveDetails({skillIds})) {
        return false
      }
      return true
    },
    ...mapState('customer', ['mine']),
    ...mapState('customerGigs', ['gig', 'gigSkills']),
    ...mapGetters('vars', ['detailGroupsBySkillId', 'detailsByGroupId', 'skillsByCategoryId', 'skillsHaveDetails', 'skillsById']),
    ...mapGetters('customerGigs', ['newGig', 'skillLevel', 'detailSelected'])
  },
  methods: {
    setStep: function (direction) {
      if (isNaN(direction)) {
        if (direction === 'back') {
          if (parseInt(this.step) === 1) {
            // time to mosey on back to the main expert page, cowboy!
            this.$router.push({name: 'company'})
          } else {
            // we need to test to make sure we aren't send someone needlessly to the details page
            if (this.step === 4 && !this.checkSkillDetails) {
              // skip a step -- these skills have no details
              this.step--
            }
            this.step--
          }
        } else {
          if (parseInt(this.step) === 5) {
            // time to mosey on back to the main expert page, cowboy!
            this.$router.push({name: 'company'})
          } else {
            if (this.step === 2 && !this.checkSkillDetails) {
              // skip a step -- these skills have no details
              this.step++
            }
            this.step++
          }
        }
      } else {
        if (parseInt(direction) === 6 || parseInt(direction) === 0) {
          // time to mosey on back to the main expert page, cowboy!
          this.$router.push({name: 'company'})
        } else {
          this.step = parseInt(direction)
        }
      }
    },
    handleNetworkError: function (error) {
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
    prepare: function (step) {
      let self = this
      let skillIdx = 0
      let groupIdx = 0
      console.log(step)
      switch (step) {
        case 3:
          if (self.gigForm.skill_category_id) {
            self.newSkills = []
            self.skillsByCategoryId({categoryId: self.gigForm.skill_category_id}).forEach((skill) => {
              self.newSkills.push({
                skill_id: skill.id,
                skill_category_id: skill.skill_category_id,
                title: skill.title,
                level: self.skillLevel(skill.id)
              })
            })
          }
          break
        case 4:
          let detailGroups = []
          self.newDetailForm = []
          self.newDetails = []
          self.gigSkills.forEach((skill) => {
            // console.log('prep step 4 with skill', skill)
            if (self.skillsHaveDetails({skillIds: [skill.skill_id]})) { // the skill has to be selected and have details
              self.newDetailForm.push({
                id: skill.skill_id,
                title: self.skillsById({skillId: skill.skill_id}).title,
                groups: []
              })
              // console.log('skill title', self.skillsById({skillId: skill.skill_id}).title)
              // add in the detail groups
              detailGroups = self.detailGroupsBySkillId({skillId: skill.skill_id})
              detailGroups.forEach((group) => {
                self.newDetailForm[skillIdx].groups.push({
                  id: group.id,
                  title: group.title,
                  details: []
                })
                // add in the detail selections
                self.detailsByGroupId(group.id).forEach((detail) => {
                  self.newDetailForm[skillIdx].groups[groupIdx].details.push({
                    id: detail.id,
                    title: detail.title
                  })
                  /// how are we going to get all the data we need into the database?
                  self.newDetails.push({
                    skill_detail_id: detail.id,
                    selected: self.detailSelected(detail.id)
                  })
                })
                groupIdx++
              })
              skillIdx++
              groupIdx = 0
            }
          })
          break
        case 6:
          // get all the selected items into a sensible format
          self.reviewForm = []
          let detailTitles = []
          let localDetailForm = JSON.parse(JSON.stringify(self.newDetailForm))
          localDetailForm.forEach((skill) => {
            // go through the groups and remove any unselected details
            for (let i = 0; i < skill.groups.length; i++) {
              detailTitles = []
              for (let j = 0; j < skill.groups[i].details.length; j++) {
                if (self.detailSelected(skill.groups[i].details[j].id)) {
                  detailTitles.push(skill.groups[i].details[j].title)
                }
              }
              skill.groups[i].details = detailTitles
            }
            self.reviewForm.push(skill)
          })
          break
      }
    }
  },
  mounted () {
    // prep data
    let self = this
    let promises = []

    self.step = 0

    promises.push(self.$store.dispatch('vars/initData'))

    // TODO: customer data has to be inited before we can continue, so we'll make this blocking and error out after a while
    promises.push(self.$store.dispatch('customer/initMyData'))

    Promise.all(promises)
      .then(() => {
        let promises = []
        // if gigId is supplied, get the gig skills and details
        if (self.$route.params && self.$route.params.gigId) {
          promises.push(self.$store.dispatch('customerGigs/getGig', {gigId: self.$route.params.gigId}))
          promises.push(self.$store.dispatch('customerGigs/getGigSkills', {gigId: self.$route.params.gigId}))
          promises.push(self.$store.dispatch('customerGigs/getGigDetails', {gigId: self.$route.params.gigId}))
          Promise.all(promises)
            .then(() => {
              // we can't edit gigs unless status === draft
              if (self.gig.status !== 'draft') {
                // TODO: use alerrt to let user know what is going on
                console.log('can not edit gigs unless status is draft')
                self.setStep(0)
              }
              self.gigForm = Object.assign({}, self.gig) // grab gig from customerGig
            })
            .catch((error) => {
              console.log('one of our promises was not fulfilled')
              if (!self.handleNetworkError(error)) {
                // not a netowrk error. probably couldn't find the gig by ID. Let's redirect to company page
                self.setStep(0)
              }
            })
            .finally(() => {
              self.step = 1
            })
        } else {
          console.log('new gig')
          self.$store.dispatch('customerGigs/clearMyData', {customer: self.mine})
          self.gigForm = Object.assign({}, self.newGig(self.mine))
          self.step = 1
        }
      })
      .catch((error) => {
        console.error(error)
      })
  }
}
</script>

<style lang="stylus">
.card__text {
  text-align: left !important
}
.button-bar-flex {
  display: flex !important;
  .btn {
    flex-grow: 1 !important;
  }
}
.text--left {
  text-align: left;
}
</style>
