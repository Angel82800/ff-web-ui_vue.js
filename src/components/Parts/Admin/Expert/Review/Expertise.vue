<template>
  <div>
    <div v-for="(categoryId, index) in categories" :key="index">
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
    </div>
    <v-container fluid grid-list-lg>
      <h2>Industries</h2>
      <h3 v-html="industryTitles(industriesById({industryIds: industries}))"></h3>
    </v-container>
  </div>
</template>

<script>
import {mapState, mapGetters} from 'vuex'

export default {
  computed: {
    ...mapState('expertIndustries', ['industries']),
    ...mapState('expertSkills', ['categories', 'skills', 'details']),
    ...mapGetters('vars', ['categoriesById', 'industriesById', 'skillsByIdsByCategoryId', 'detailsByIdBySkillId', 'skillDetailName'])
  },
  methods: {
    detailTitles (details) {
      let titles = []
      for (let i = 0; i < details.length; i++) {
        titles.push(details[i].title)
      }
      return titles.join(', ')
    },
    industryTitles (industries) {
      let titles = []
      for (let i = 0; i < industries.length; i++) {
        titles.push(industries[i].title)
      }
      return titles.join(', ')
    }
  }
}
</script>
