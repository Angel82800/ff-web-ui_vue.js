<template>
  <v-container fluid grid-list-lg>
    <v-layout row wrap>
      <template v-if="employers.length">
        <v-flex xs12 sm6 v-for="(employer, index) in employers" :key="index">
          <h1>{{ employer.name }}</h1>
          <h2>{{ employer.startYYYYMM }} &mdash; {{ employer.endYYYYMM || 'present' }}</h2>
          <h3 v-html="skillDetailsList(employerSkillDetails({employerId: employer.id}))"></h3>
        </v-flex>
      </template>
      <v-flex v-else xs12 sm6 >
        <h1>No employers found</h1>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import {mapState, mapGetters} from 'vuex'
export default {
  props: ['userId'],
  computed: {
    ...mapState('expertHistory', ['employers']),
    ...mapGetters('vars', ['skillDetailName']),
    ...mapGetters('expertHistory', ['formatDate', 'employerSkillDetails'])
  },
  methods: {
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
  },
  mounted () {
    // get employers for the user id submitted
    let self = this
    if (self.userId) {
      self.$store.dispatch('expertHistory/initEditData', {userProfileId: self.userId})
    }
  }
}
</script>
