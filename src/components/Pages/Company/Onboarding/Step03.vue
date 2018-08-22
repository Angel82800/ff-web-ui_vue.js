<template>
  <v-card flat>
    <v-card-actions class="mb-3">
      <v-btn  :loading="form_loading" :disabled="form_loading" @click="setStep(parseInt(step) - 1)" color="primary"><v-icon left dark class="hidden-xs-only">arrow_back</v-icon>{{ backButton }}</v-btn>
      <v-spacer></v-spacer>
      <p class="title hidden-xs-only">
        {{ pageTitle }}
      </p>
      <v-spacer class="hidden-xs-only"></v-spacer>
      <v-btn :loading="form_loading" :disabled="form_loading" @click="setStep(parseInt(step) + 1)" color="primary">{{ forwardButton }}<v-icon right dark class="hidden-xs-only">arrow_forward</v-icon></v-btn>
    </v-card-actions>

    <p class="title hidden-sm-and-up">
      {{ pageTitle }}
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
            <v-flex xs12>
              <h1>{{ customer.name }}</h1>
              <h2>
                {{ customer.street1 }}
                <br>
                {{ customer.city + ', ' + customer.state + ' ' + customer.postalCode }}
              </h2>
            </v-flex>
            <v-flex xs12 sm6>
              <h2>Hours of operation</h2>
              <h3>
                {{ operationHours }}
                <br>
                {{ operationDays }}
              </h3>
            </v-flex>
            <v-flex xs12 sm6>
              <h2>Industries</h2>
              <h3 v-html="industryTitles"></h3>
            </v-flex>
          </v-layout>
        </v-container>
      </v-card-text>
    </v-card>

    <v-card class="elevation-3 mb-3 mx-1">
      <v-toolbar dark color="grey" @click="setStep('2')" class="pointer">
        <v-toolbar-title class="headline white--text">Positions</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-icon>edit</v-icon>
      </v-toolbar>
      <v-card-text>
        <div v-for="(categoryId, index) in categories" :key="index">
          <h1 v-html="categoriesById({categoryIds: [categoryId] })[0].title"></h1>
          <v-container fluid grid-list-lg>
            <v-layout row wrap>
              <v-flex xs12 sm6 v-for="(skill, index) in skillsByIdsByCategoryId({categoryId, skills})" :key="index">
                <h2 v-html="skill.title"></h2>
                <div v-for="(group, groupIndex) in detailsByIdBySkillId({skillId: skill.id, details})" :key="groupIndex">
                  <h3 v-html="group.title"></h3>
                  <h4 v-html="detailTitles(group.details)" class="grey--text text--darken-1"></h4>
                </div>
              </v-flex>
            </v-layout>
          </v-container>
        </div>
        <div v-if="categories.length === 0">
          <h1>No position information supplied</h1>
        </div>
      </v-card-text>
    </v-card>
  </v-card>
</template>

<script>
import {mapState, mapGetters} from 'vuex'
export default {
  props: ['customer'],
  data () {
    return {
      pageTitle: `Let's review`,
      form_loading: false,
      step: 1,
      backButton: 'Requirements',
      forwardButton: 'Looks good!'
    }
  },
  computed: {
    industryTitles: function () {
      let titles = []
      let industries = this.industriesById({industryIds: this.industries}) // see mapState/Getters
      for (let i = 0; i < industries.length; i++) {
        titles.push(industries[i].title)
      }
      return titles.join(', ')
    },
    ...mapState('customerSkills', ['categories', 'skills', 'details']),
    ...mapState('customerIndustries', ['industries']),
    ...mapGetters('customer', ['operationHours', 'operationDays']),
    ...mapGetters('vars', ['categoriesById', 'industriesById', 'skillsByIdsByCategoryId', 'detailsByIdBySkillId', 'skillDetailName'])
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
        titles.push(details[i].title)
      }
      return titles.join(', ')
    }
  }
}
</script>

<style>
.pointer {
  cursor: pointer;
}
.card__text {
  text-align: left;
}
h4 {
  margin-bottom: 15px;
}
h3 {
  margin: 5px 0;
}
</style>
