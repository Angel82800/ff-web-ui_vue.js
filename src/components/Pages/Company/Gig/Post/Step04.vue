<template>
  <v-card flat>
    <stepButtons @navigate="setStep" :formLoading="form_loading" :formValid="form_valid" :backButton="backButton" :forwardButton="forwardButton" :top="true" :title="pageTitle" />

    <p class="title hidden-sm-and-up" v-html="pageTitle"></p>

    <p class="headline">
      What skill-related knowledge is involved in this job?
    </p>

    <v-container fluid grid-list-xl class="pt-0 mb-5">
      <div class="text-xs-left">
        <div class="my-2" v-for="(skill, skillIndex) in newDetailForm" :key="skillIndex">
          <h1 v-html="skill.title"></h1>
          <div class="my-2" v-for="(group, groupIndex) in skill.groups" :key="groupIndex">
            <h2 v-html="group.title"></h2>
            <v-btn
              v-for="(detail, detailIndex) in group.details"
              :key="detailIndex"
              outline
              :disabled="form_loading"
              :color="detailState(detail.id) ? 'primary': ''"
              :dark="!form_loading && (detailState(detail.id) ? true : false)"
              @click.native="toggleDetail(detail.id)"
            >
              <span v-html="detail.title"></span>
              <v-icon right dark v-html="detailState(detail.id) ? 'check_box' : 'check_box_outline_blank'">check</v-icon>
            </v-btn>
          </div>
        </div>
      </div>
    </v-container>

    <stepButtons @navigate="setStep" :formLoading="form_loading" :formValid="form_valid" :backButton="backButton" :forwardButton="forwardButton" :top="false" :title="pageTitle" />
  </v-card>
</template>

<script>
import {mapState, mapGetters} from 'vuex'
import StepButtons from '@/components/Parts/StepButtons.vue'

export default {
  components: {
    stepButtons: StepButtons
  },
  props: ['newDetailForm', 'newDetails'],
  data () {
    return {
      step: 4,
      form_loading: false,
      backButton: 'Back',
      forwardButton: 'Next',
      pageTitle: 'Any specific experience needed?'
    }
  },
  computed: {
    form_valid: function () {
      let self = this
      let groupIndex = -1
      // loop through skills to get to groups. Look for at least one selected item in each group of details
      for (let i = 0; i < self.newDetailForm.length; i++) {
        for (let j = 0; j < self.newDetailForm[i].groups.length; j++) {
          groupIndex = self.newDetailForm[i].groups[j].details.findIndex((detail) => {
            let selectedIndex = self.selectedDetails.findIndex((selectedId) => {
              return selectedId.skill_detail_id === detail.id
            })
            return (selectedIndex > -1)
          })
          if (groupIndex < 0) {
            return false
          }
        }
      }
      return true
    },
    selectedDetails: function () {
      let selectedDetailIds = []
      for (let i = 0; i < this.newDetails.length; i++) {
        if (this.newDetails[i].selected) {
          selectedDetailIds.push({skill_detail_id: this.newDetails[i].skill_detail_id})
        }
      }
      return selectedDetailIds
    },
    ...mapState('customerGigs', ['gigSkills']),
    ...mapGetters('customerGigs', ['detailSelected']),
    ...mapGetters('vars', ['detailGroupsBySkillId', 'detailsByGroupId'])
  },
  methods: {
    // TODO: move this to an event at Index and emit gig
    setStep: function (direction) {
      let self = this
      let currentStep = self.step
      let newStep = (direction === 'back') ? currentStep - 1 : currentStep + 1
      new Promise((resolve, reject) => {
        self.form_loading = true
        self.$store.dispatch('customerGigs/replaceGigDetails', {gigDetails: self.selectedDetails})
          .then(() => {
            // success, we can move on
            // emit call to prepare next step
            self.$emit('prepare', newStep)
            resolve(newStep)
          })
          .catch((error) => {
            console.log('error in setStep.stepWork')
            reject(error)
          })
          .finally(() => {
            self.form_loading = false
          })
      })
        .then((step) => {
          self.$emit('navigate', (step > self.step) ? 'next' : 'back')
        })
        .catch((error) => {
          console.error('error in setStep resolution', error)
          self.$emit('networkError', error)
        })
        .finally(() => {
          console.log('completing set step')
        })
    },
    skillTitle: function (skillId) {
      let skill = this.newSkills.find((skill) => {
        return skill.skill_id === skillId
      })
      return skill.title
    },
    detailState: function (detailId) {
      let index = this.newDetails.findIndex(detail => {
        return detail.skill_detail_id === detailId
      })
      if (index > -1) {
        return this.newDetails[index].selected
      }
    },
    toggleDetail: function (detailId) {
      if (!this.form_loading) {
        let index = this.newDetails.findIndex(detail => {
          return detail.skill_detail_id === detailId
        })
        this.newDetails[index].selected = !this.newDetails[index].selected
      }
    }
  }
}
</script>
