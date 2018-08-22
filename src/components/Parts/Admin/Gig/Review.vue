<template>
  <div>
    <v-card class="mb-3 mx-1">
      <v-toolbar flat>
        <v-toolbar-title>Status: {{gig.status}}</v-toolbar-title>
        <v-spacer />
        <v-switch
          v-if="showSearch"
          :label="`Skill detail criteria: ${searchFilterModel ? 'On' : 'Off'}`"
          v-model="searchFilterModel"
          color="primary"
          class="mt-4"
        ></v-switch>
      </v-toolbar>

      <v-card-text>
        <v-dialog v-model="publishDialog" persistent max-width="290">
          <v-btn slot="activator" :loading="processing" v-if="draftOrReview" outline color="primary">Publish job</v-btn>
          <v-card>
            <v-card-title class="headline">Publish this job?</v-card-title>
            <v-card-text>Publishing a job creates notifications to FactoryFix staff and matching Skilled Professionals. Once live, a job can not be put back into draft mode. Do you with to proceed?</v-card-text>
            <v-card-actions>
              <v-btn flat color="primary" @click.native="publishDialog = false">Keep draft</v-btn>
              <v-spacer></v-spacer>
              <v-btn flat color="primary" @click="setLive()">Publish job</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
        <v-container fluid grid-list-lg v-if="showSearch">
          <v-layout row wrap>
            <v-flex xs12 md6 lg3>
              <v-btn v-if="prospectsNotNotified" outline color="primary" @click="setView('prospects')">
                <v-badge color="red">
                  <span slot="badge">{{ prospectsNotNotified }}</span>
                  <span>View un-notified prospects</span>
                </v-badge>
              </v-btn>
              <h3 v-else>All matching prospects have been notified.</h3>
            </v-flex>
            <v-flex xs12 md6 lg3>
              <v-btn v-if="rejectedNotInterested > 0" outline color="primary" @click="setView('rejectedNotInterested')">
                 <v-badge color="red">
                  <span slot="badge">{{ rejectedNotInterested }}</span>
                  <span>View Rejected/not interested</span>
                </v-badge>
              </v-btn>
            </v-flex>
            <v-flex xs12 v-if="applicants.length">
              <applicantList @getExpert="getExpert" @setStatus="setApplicantStatus"></applicantList>
            </v-flex>
          </v-layout>
        </v-container>
        <v-container fluid grid-list-lg v-if="gigForm.status === 'filled'">
          <v-layout row wrap>
            <v-flex xs12>
              <applicant-column :applicants="hired" title="Hired expert" empty="There are no hired experts" no="Offered" no-label="Undo" yes="" yes-label="" @view="getExpert" @status="setApplicantStatus"></applicant-column>
            </v-flex>
          </v-layout>
        </v-container>
      </v-card-text>
    </v-card>
    <v-card class="elevation-3 mb-3 mx-1">
       <v-toolbar flat @click="setView('form')" :class="editable ? 'pointer' : ''">
        <v-toolbar-title>Overview</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-icon v-if="editable">edit</v-icon>
      </v-toolbar>
      <v-card-text>
        <v-container fluid grid-list-lg>
          <v-layout row wrap>
            <v-flex xs12>
              <h1 v-html="categoriesById({categoryIds: [gigForm.skill_category_id]})[0].title"></h1>
            </v-flex>
            <v-flex v-if="gigForm.description" xs12>
              <h2>Details</h2>
              <pre v-html="gigForm.description"></pre>
            </v-flex>
            <v-flex xs12 :md6="reviewForm.length > 1" v-for="(skill, skillIndex) in reviewForm" :key="skillIndex">
              <h2 v-html="skill.title"></h2>
              <h4 v-html="getSkillLevel(skill.id)"></h4>
              <div v-for="(group, groupIndex) in skill.groups" :key="groupIndex">
                <h3 v-html="group.title"></h3>
                <p v-html="detailTitles(group.details)"></p>
              </div>
            </v-flex>
            <!-- <v-flex xs12>
              <h2>
                Hours and days
              </h2>
              <h3>
                {{ requiredHours }}
              </h3>
              <h3>
                {{ requiredDays }}
              </h3>
            </v-flex>
            <v-flex xs12 md9 lg6>
              <v-card flat class="mb-4">
                <v-card-media :src="mapUrl" height="250px"></v-card-media>
                <v-card-text>
                  <h2>
                    {{ gigForm.street1 }}, {{ gigForm.city }}, {{ gigForm.state }} {{ gigForm.postalCode }}
                  </h2>
                </v-card-text>
              </v-card>
            </v-flex> -->
          </v-layout>
        </v-container>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
import {mapState, mapGetters} from 'vuex'
import applicantList from '@/components/Parts/Gigs/ApplicantList'
import applicantColumn from '@/components/Parts/Gigs/ApplicantColumn'
export default {
  props: ['gigForm', 'reviewForm', 'searchFilter'],
  components: {
    applicantList,
    applicantColumn
  },
  data () {
    return {
      processingIds: [],
      processing: false,
      publishDialog: false
    }
  },
  computed: {
    searchFilterModel: {
      get: function () {
        return this.searchFilter
      },
      set: function (val) {
        this.$emit('setFilter', val)
      }
    },
    prospectsNotNotified () {
      let self = this
      return self.experts.filter((expert) => {
        // if the user is not already in the current pool of applicants, true
        let idx = self.applicants.findIndex((applicant) => {
          return applicant.expert_id === expert.id
        })
        return (idx === -1)
      }).length
    },
    rejectedNotInterested () {
      let goners = this.applicants.filter(applicant => {
        return (applicant.status === 'Rejected' || applicant.status === 'Not interested')
      })
      return goners.length
    },
    hired () {
      return this.applicants.filter(applicant => {
        return applicant.status === 'Hired'
      })
    },
    mapUrl: function () {
      let coords = `${this.gigForm.latitude},${this.gigForm.longitude}`
      let markers = encodeURIComponent(`color:0x${this.colors.baseGreen}|${coords}`)
      return `https://maps.googleapis.com/maps/api/staticmap?center=${coords}&size=600x250&markers=${markers}&key=${this.googlePlacesKey}`
    },
    showSearch: function () {
      let statusTest = ['live']
      return (statusTest.indexOf(this.gig.status) > -1)
    },
    draftOrReview: function () {
      let statusTest = ['draft', 'review']
      return (statusTest.indexOf(this.gig.status) > -1)
    },
    ...mapState('vars', ['expertise', 'googlePlacesKey', 'colors']),
    ...mapState('adminGigs', ['gig', 'gigSkills', 'applicants']),
    ...mapState('expert', ['experts']),
    ...mapGetters('vars', ['categoriesById', 'detailGroupsBySkillId', 'detailsByGroupId', 'skillsHaveDetails', 'skillsById']),
    ...mapGetters('adminGigs', ['detailSelected', 'requiredHours', 'requiredDays', 'editable'])
  },
  methods: {
    setApplicantStatus: function ({ applicant, status }) {
      let self = this
      applicant = Object.assign({}, applicant)
      applicant.status = status
      self.$store.dispatch(`adminGigs/putApplicant`, {applicant})
    },
    setLive: function () {
      let self = this
      let currentStatus = self.gigForm.status
      self.gigForm.status = 'live'
      self.processing = true
      self.$store.dispatch('adminGigs/updateGig', {gig: self.gigForm})
        .then(() => {
          // we need to update the mothership so we can see any applicants.
          self.$emit('expertSearch')
        })
        .catch((error) => {
          console.log(error)
          self.gigForm.status = currentStatus
        })
        .finally(() => {
          self.processing = false
          self.publishDialog = false
        })
    },
    getExpert: function (id) {
      this.$emit('getExpert', id)
    },
    getSkillLevel: function (skillId) {
      let self = this
      for (let i = 0; i < self.gigSkills.length; i++) {
        if (self.gigSkills[i].skill_id === skillId) {
          return self.expertise.skillLevels[self.gigSkills[i].level]
        }
      }
    },
    setView: function (view) {
      this.$emit('navigate', view)
    },
    detailTitles: function (details) {
      let titles = []
      for (let i = 0; i < details.length; i++) {
        titles.push(details[i].title)
      }
      return titles.join(', ')
    }
  }
}
</script>
