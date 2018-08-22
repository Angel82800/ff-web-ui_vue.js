<template>
  <div>
    <v-card flat>
      <v-card-actions class="mb-3">
        <v-btn @click="setStep(0)" color="primary"><v-icon left dark>arrow_back</v-icon><span class="hidden-xs-only">Step 3</span></v-btn>
        <v-spacer></v-spacer>
        <p class="title hidden-xs-only">
          Let's review!
        </p>
        <v-spacer class="hidden-xs-only"></v-spacer>
        <v-btn @click="setStep(2)" color="primary"><span class="hidden-xs-only">Looks good!</span><v-icon right dark>arrow_forward</v-icon></v-btn>
      </v-card-actions>
      <p class="title hidden-sm-and-up">
        Let's review!
      </p>
      <v-card class="elevation-3 mb-3 mx-1">
        <v-toolbar dark color="grey" @click="setStep('1')" class="pointer">
          <v-toolbar-title class="headline white--text">Basic info</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-icon>edit</v-icon>
        </v-toolbar>
        <v-card-text>
          <v-container fluid grid-list-lg>
            <v-layout row wrap>
              <v-flex xs12 sm6>
                <h1>{{ profile.name_first + ' ' + profile.name_last }}</h1>
                <h2 v-if="expert.phone">{{ expert.phone }}</h2>
                <h2 v-if="profile.email">{{ profile.email }}</h2>
                <h2 v-if="expert.street1">{{ expert.street1 }}</h2>
                <h2 v-if="cityStateZip">{{ cityStateZip }}</h2>
              </v-flex>
              <v-flex xs12 sm6>
                <photo-upload :expert="expert" :profile="profile"></photo-upload>
              </v-flex>
              <v-flex xs12>
                <v-alert :value="!hasBasic" outline type="error">
                  {{ warnings.expert.basic }}
                </v-alert>
                <v-alert :value="avatar === 'icon'" outline type="error" transition="scale-transition">
                  {{ warnings.expert.photo }}
                </v-alert>
              </v-flex>
            </v-layout>
          </v-container>
        </v-card-text>
      </v-card>
      <v-card class="elevation-3 mb-3 mx-1">
        <v-toolbar dark color="grey" @click="setStep('2')" class="pointer">
          <v-toolbar-title class="headline white--text">Expertise</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-icon>edit</v-icon>
        </v-toolbar>
        <v-card-text>
          <v-container fluid grid-list-lg>
            <v-layout row wrap>
              <v-flex xs12 v-for="(categoryId, index) in categories" :key="index">
                <h1>{{ categoriesById({categoryIds: [categoryId] })[0].title }}</h1>
                <v-container fluid grid-list-lg>
                  <v-layout row wrap>
                    <v-flex xs12 sm6 md4 v-for="(skill, index) in skillsByIdsByCategoryId({categoryId, skills})" :key="index">
                      <h2 v-html="skill.title"></h2>
                      <div v-for="(group, groupIndex) in detailsByIdBySkillId({skillId: skill.id, details})" :key="groupIndex">
                        <h3 v-html="group.title"></h3>
                        <h4 v-html="detailTitles(group.details)" class="grey--text text--darken-1"></h4>
                      </div>
                    </v-flex>
                  </v-layout>
                </v-container>
              </v-flex>
              <v-flex xs12 v-if="industries.length">
                <h2>Industries</h2>
                <h3 v-html="industryTitles(industriesById({industryIds: industries}))"></h3>
              </v-flex>
              <v-flex v-if="!industries.length || !categories.length" xs12>
                <v-alert :value="true" outline type="error">
                  {{ warnings.expert.expertise }}
                </v-alert>
              </v-flex>
            </v-layout>
          </v-container>
        </v-card-text>
      </v-card>
      <v-card class="elevation-3 mb-3 mx-1 pb-3">
        <v-toolbar dark color="grey" @click="setStep('3')" class="pointer">
          <v-toolbar-title class="headline white--text">Employment history</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-icon>edit</v-icon>
        </v-toolbar>
        <v-card-text>
          <v-container fluid grid-list-lg>
            <v-layout row wrap>
              <v-flex xs12 sm6 v-for="(employer, index) in employers" :key="index">
                <h1>{{ employer.name }}</h1>
                <h2>{{ employer.startYYYYMM }} &mdash; {{ employer.endYYYYMM || 'present' }}</h2>
                <h2 v-if="employer.pay_rate > 0" v-html="'Hourly rate: $' + employer.pay_rate"></h2>
                <!-- <h3 v-html="skillDetailsList(employerSkillDetails({employerId: employer.id}))"></h3> -->
              </v-flex>
              <v-flex v-if="employers.length === 0" xs12>
                <v-alert :value="true" outline type="error">
                  {{ warnings.expert.history }}
                </v-alert>
              </v-flex>
            </v-layout>
          </v-container>
        </v-card-text>
      </v-card>
      <!-- <v-card class="elevation-3 mb-3 mx-1 pb-3">
        <v-toolbar dark color="grey" @click="setStep('4')">
          <v-toolbar-title class="headline white--text">Availability</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-icon>edit</v-icon>
        </v-toolbar>
        <v-card-text>
          <v-container fluid grid-list-lg>
            <v-layout row wrap>
              <v-flex xs12 sm6>
                <h1>Available hours</h1>
                <h2>{{ availableHours('mine') }}</h2>
              </v-flex>
              <v-flex xs12 sm6>
                <h1>Available Days</h1>
                <h2>{{ availableDays('mine') }}</h2>
              </v-flex>
            </v-layout>
          </v-container>
        </v-card-text>
      </v-card> -->
      <v-card-actions class="mb-3">
        <v-btn @click="setStep(0)" color="primary"><v-icon left dark>arrow_back</v-icon><span class="hidden-xs-only">Step 3</span></v-btn>
        <v-spacer></v-spacer>
        <v-btn @click="setStep(2)" color="primary"><span class="hidden-xs-only">Looks good!</span><v-icon right dark>arrow_forward</v-icon></v-btn>
      </v-card-actions>
    </v-card>
  </div>
</template>

<script>
import {mapState, mapGetters} from 'vuex'
import PhotoUpload from '@/components/Parts/PhotoUpload'
export default {
  props: ['expert', 'profile'],
  components: {
    photoUpload: PhotoUpload
  },
  data () {
    return {
      step: 1
    }
  },
  computed: {
    avatar: function () {
      if (this.expert.photo_url !== 'none') {
        if (this.expert.photo_url) {
          return 'photo'
        }
        if (this.profile.auth0_avatar) {
          return 'avatar'
        }
      }
      return 'icon'
    },
    hasBasic: function () {
      return (this.profile.name_first && this.profile.name_last && this.profile.email && this.expert.postalCode)
    },
    cityStateZip () {
      return (this.expert.city ? this.expert.city + ', ' : '') + (this.expert.state ? this.expert.state + ', ' : '') + (this.expert.postalCode ? this.expert.postalCode : '') // we should definitely have a postal code, but we may not have city and state
    },
    ...mapState('expertSkills', ['categories', 'skills', 'details']),
    ...mapState('expertIndustries', ['industries']),
    ...mapState('expertHistory', ['employers']),
    ...mapState('vars', ['warnings']),
    ...mapGetters('expert', ['availableHours', 'availableDays']),
    ...mapGetters('expertHistory', ['formatDate', 'employerSkillDetails']),
    ...mapGetters('vars', ['cleanedAlphaName', 'categoriesById', 'industriesById', 'skillsByIdsByCategoryId', 'detailsByIdBySkillId', 'skillDetailName'])
  },
  methods: {
    setStep: function (step) {
      let self = this
      // we'll pass integers for local traffic and strings for moving between onboarding steps
      if (step === 2) {
        self.$emit('navigate', 'next')
      } else if (step === 0) {
        self.$emit('navigate', 'back')
      } else {
        self.$emit('navigate', step)
      }
    },
    detailTitles: function (details) {
      let titles = []
      for (let i = 0; i < details.length; i++) {
        titles.push(this.cleanedAlphaName(details[i].title))
      }
      return titles.join(', ')
    },
    industryTitles: function (industries) {
      let titles = []
      for (let i = 0; i < industries.length; i++) {
        titles.push(this.cleanedAlphaName(industries[i].title))
      }
      return titles.join(', ')
    },
    skillDetailsList: function (skillDetails) {
      let list = []
      for (let i = 0; i < skillDetails.length; i++) {
        list.push(this.skillDetailName({skillDetailId: skillDetails[i].expert_skill_detail_skill_detail_id}))
      }
      list.sort((a, b) => {
        return a > b
      })
      return list.join('<br>')
    }
  }
}
</script>

<style>
.pointer {
  cursor: pointer;
}
</style>
