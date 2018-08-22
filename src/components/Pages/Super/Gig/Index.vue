<template>
  <div class="text-sm-left">
    <!-- TODO: one button with logic in 'computed' -->
    <v-btn v-if="view === 'review' || (view === 'form' && $route.params.companyId)" color="primary" outline @click.native="$router.go(-1)" class="mb-4"><v-icon left>arrow_back</v-icon>Back</v-btn>
    <v-btn v-if="view === 'prospects' || view === 'expert' || view === 'rejectedNotInterested'" color="primary" outline @click="navigate('review')" class="mb-4"><v-icon left>arrow_back</v-icon>Back to gig overview</v-btn>

    <v-card v-if="!gigForm && !loadFail">
      <v-card-title>
        <h1>Loading gig data</h1>
      </v-card-title>
      <v-card-text>
        <v-progress-circular indeterminate :size="50" color="primary"></v-progress-circular>
      </v-card-text>
    </v-card>
    <transition name="fade" mode="out-in">
      <gig-review v-if="!loadFail && gigForm && gigForm.skill_category_id > 0 && view === 'review'" :gigForm="gigForm" :reviewForm="reviewForm" :searchFilter="searchFilter" @navigate="navigate" @getExpert="getExpert" @expertSearch="expertSearch" @setFilter="setFilter"></gig-review>
      <gig-form-container v-if="view === 'form'" :gigForm="gigForm" :reviewForm="reviewForm" :skillsForm="skillsForm" :detailsForm="detailsForm" :details="details" home="review" @navigate="navigate" @prepare="prepare" @refresh="refresh"></gig-form-container>
      <gig-prospects v-if="view === 'prospects'" :gigForm="gigForm" :searchFilter="searchFilter" @navigate="navigate" @network="handleNetworkError" @getExpert="getExpert" @setFilter="setFilter"></gig-prospects>
      <rejected-not-interested v-if="view === 'rejectedNotInterested'" @navigate="navigate" @network="handleNetworkError" @getExpert="getExpert"></rejected-not-interested>
      <expert-review-container v-if="view === 'expert'" :loadFail="loadFail" :profileForm="profileForm" :expertForm="expertForm" @networkError="handleNetworkError" @refresh="refresh" @setView="navigate"></expert-review-container>
    </transition>
  </div>
</template>

<script>

import {mapState, mapGetters} from 'vuex'
import gigReview from '@/components/Parts/Admin/Gig/Review'
import gigFormContainer from '@/components/Parts/Admin/Gig/FormContainer'
import gigProspects from '@/components/Parts/Admin/Gig/Prospects'
import expertReviewContainer from '@/components/Parts/Admin/Expert/Review/Container'
import rejectedNotInterested from '@/components/Parts/Admin/Gig/RejectedNotInterested'
export default {
  components: {
    gigReview,
    gigFormContainer,
    gigProspects,
    expertReviewContainer,
    rejectedNotInterested
  },
  data () {
    return {
      searchFilter: true,
      view: 'review',
      loadFail: false,
      gigForm: false,
      reviewForm: false,
      skillsForm: [],
      detailsForm: [],
      details: [],
      profileForm: false,
      expertForm: false
    }
  },
  computed: {
    ...mapState('adminGigs', ['gig', 'gigSkills', 'applicants']),
    ...mapState('expert', ['edit']),
    ...mapState('customer', ['customer']),
    ...mapGetters('vars', ['categoriesById', 'detailGroupsBySkillId', 'detailsByGroupId', 'skillsByCategoryId', 'skillsHaveDetails', 'skillsById']),
    ...mapGetters('adminGigs', ['skillLevel', 'detailSelected', 'requiredHours', 'requiredDays', 'editable']),
    ...mapGetters('userProfile', ['getUserById']),
    ...mapGetters('customerGigs', ['newGig'])
  },
  methods: {
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
    navigate: function (where) {
      this.view = where || 'review'
    },
    refresh: function (which) {
      let self = this
      switch (true) {
        case which === 'forms':
          self.updateForms()
          break
        case which.indexOf('profile') > -1:
          self.profileForm = Object.assign({}, self.getUserById(self.profileForm.id))
          // falls through
        case which.indexOf('expert') > -1:
          self.expertForm = Object.assign({}, self.edit)
          // falls through
      }
    },
    prepare: function (step) {
      let self = this
      switch (step) {
        case 2:
          if (self.gigForm.skill_category_id) {
            self.skillsForm = []
            self.skillsByCategoryId({categoryId: self.gigForm.skill_category_id}).forEach((skill) => {
              self.skillsForm.push({
                skill_id: skill.id,
                skill_category_id: skill.skill_category_id,
                title: skill.title,
                level: self.skillLevel(skill.id)
              })
            })
          }
          break
        case 3:
          let detailGroups = []
          let skillIdx = 0
          let groupIdx = 0
          self.detailsForm = []
          self.details = []
          self.gigSkills.forEach((skill) => {
            self.detailsForm.push({
              id: skill.skill_id,
              title: self.skillsById({skillId: skill.skill_id}).title,
              groups: []
            })
            if (self.skillsHaveDetails({skillIds: [skill.skill_id]})) { // the skill has to be selected and have details
              // add in the detail groups
              detailGroups = self.detailGroupsBySkillId({skillId: skill.skill_id})
              detailGroups.forEach((group) => {
                self.detailsForm[skillIdx].groups.push({
                  id: group.id,
                  title: group.title,
                  details: []
                })
                // add in the detail selections
                self.detailsByGroupId(group.id).forEach((detail) => {
                  self.detailsForm[skillIdx].groups[groupIdx].details.push({
                    id: detail.id,
                    title: detail.title
                  })
                  /// how are we going to get all the data we need into the database?
                  self.details.push({
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
      }
    },
    getExpert: function (userProfileId) {
      let self = this
      let query = {id: userProfileId}
      let promises = []
      promises.push(self.$store.dispatch('userProfile/getUsers', {query}))
      promises.push(self.$store.dispatch('expert/getExpert', {userProfileId: userProfileId}))
      promises.push(self.$store.dispatch('expertSkills/initEditData', {userProfileId: userProfileId}))
      promises.push(self.$store.dispatch('expertIndustries/initEditData', {userProfileId: userProfileId}))
      Promise.all(promises)
        .then(() => {
          self.profileForm = Object.assign({}, self.getUserById(userProfileId))
          if (!self.profileForm) {
            self.loadFail = true
          } else {
            self.$store.commit('userProfile/setEdit', {profile: self.profileForm})
            self.expertForm = Object.assign({}, self.edit)
            if (!self.expertForm) {
              self.loadFail = true
            } else {
              self.navigate('expert')
            }
          }
        })
        .catch((error) => {
          self.handleNetworkError(error)
          self.loadFail = true
        })
    },
    expertSearch: function () {
      let self = this
      let query = {
        skill_ids: [],
        skill_detail_ids: [],
        locationId: self.gigForm.locationId
      }
      for (let i = 0; i < self.reviewForm.length; i++) {
        query.skill_ids.push(self.reviewForm[i].id)
        if (self.searchFilter && self.reviewForm[i].groups && self.reviewForm[i].groups.length) {
          for (let j = 0; j < self.reviewForm[i].groups.length; j++) {
            for (let k = 0; k < self.reviewForm[i].groups[j].details.length; k++) {
              query.skill_detail_ids.push(self.reviewForm[i].groups[j].details[k].id)
            }
          }
        }
      }
      self.$store.dispatch('expert/search', {query})
    },
    setFilter: function (val) {
      this.searchFilter = val
      this.expertSearch()
    },
    updateForms: function () {
      let self = this
      self.gigForm = Object.assign({}, self.gig) // grab gig from adminGigs
      self.reviewForm = []
      self.detailsForm = []
      self.details = []
      self.prepare(2) // skills
      self.prepare(3) // skill details
      let tempDetails
      JSON.parse(JSON.stringify(self.detailsForm)).forEach((skill) => {
        // go through the groups and remove any unselected details
        for (let i = 0; i < skill.groups.length; i++) {
          tempDetails = []
          for (let j = 0; j < skill.groups[i].details.length; j++) {
            if (self.detailSelected(skill.groups[i].details[j].id)) {
              tempDetails.push({id: skill.groups[i].details[j].id, title: skill.groups[i].details[j].title})
            }
          }
          skill.groups[i].details = tempDetails
        }
        self.reviewForm.push(skill)
      })
      // let's preemptively do the candidate search if the status is appropriate
      if (self.editable) {
        self.expertSearch()
      }
    }
  },
  mounted () {
    let self = this
    let promises = []
    self.gigForm = false
    self.reviewForm = []
    self.detailsForm = []
    self.details = []

    if (self.$route.params) {
      // if gigId is supplied, get the gig skills and details
      if (self.$route.params.gigId) {
        promises.push(self.$store.dispatch('adminGigs/getGig', {gigId: self.$route.params.gigId}))
        promises.push(self.$store.dispatch('adminGigs/getGigSkills', {gigId: self.$route.params.gigId}))
        promises.push(self.$store.dispatch('adminGigs/getGigDetails', {gigId: self.$route.params.gigId}))
        promises.push(self.$store.dispatch('adminGigs/getApplicants', {gigId: self.$route.params.gigId}))
        Promise.all(promises)
          .then(() => {
            self.updateForms()
          })
          .catch((error) => {
            console.log('one of our promises was not fulfilled', error)
            if (!self.handleNetworkError(error)) {
              // not a network error. probably couldn't find the gig by ID. Let's redirect to company page
              self.loadFail = true
            }
          })
      } else if (self.$route.params.companyId) {
        // we're adding a gig on behalf of a company
        self.view = 'form'
        // get company object and use it to create a gig
        if (!self.customer || self.customer.id !== self.$route.params.companyId) {
          // get one
        } else {
          self.gigForm = Object.assign({}, self.newGig(self.customer))
        }
      }
    }
  },
  watch: {
    gig (newVal) {
      let self = this
      self.gigForm = Object.assign({}, self.gig)
    }
  }
}
</script>
