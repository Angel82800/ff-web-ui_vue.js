<template>
  <v-card flat>
    <stepButtons @navigate="setStep" :formLoading="formLoading" :formValid="formValid" :backButton="backButton" :forwardButton="forwardButton" :top="true" :title="pageTitle" />

    <p class="title hidden-sm-and-up" v-html="pageTitle"></p>

    <v-container fluid grid-list-xl class="pt-0 mb-3">
      <div class="text-xs-left">
        <div class="mt-2 mb-3" v-for="(skill, skillIndex) in categorySkills(categoryForm)" :key="skillIndex">
          <h2>{{ skill.title }}</h2>
          <v-btn-toggle class="button-bar-flex button-bar-primary mt-2 mb-2" v-model="skill.level">
            <v-btn v-for="(level, levelIndex) in expertise.skillLevels" :key="levelIndex" :disabled="formLoading" block :value="levelIndex">
              <div v-html="expertise.skillLevels[levelIndex]"></div>
            </v-btn>
          </v-btn-toggle>
        </div>
      </div>
    </v-container>

    <stepButtons @navigate="setStep" :formLoading="formLoading" :formValid="formValid" :backButton="backButton" :forwardButton="forwardButton" :top="false" :title="pageTitle" />

  </v-card>
</template>

<script>
import {mapState} from 'vuex'

export default {
  props: ['categoryForm', 'skillsForm', 'pageTitle', 'formLoading', 'formValid'],
  components: {
    StepButtons: () => import('@/components/Parts/StepButtons.vue')
  },
  data: () => ({
    backButton: 'Back',
    forwardButton: 'Next'
  }),
  computed: {
    ...mapState('vars', ['expertise'])
  },
  methods: {
    setStep: function (direction) {
      let newSkills = []
      for (let i = 0; i < this.skillsForm.length; i++) {
        if (parseInt(this.skillsForm[i].level) > 0) {
          newSkills.push({
            skill_id: this.skillsForm[i].skill_id,
            level: this.skillsForm[i].level
          })
        }
      }
      let data = {
        direction,
        newSkills
      }
      this.$emit('process', data)
    },
    categorySkills: function (categoryId) {
      return this.skillsForm.filter(skill => {
        return skill.skill_category_id === categoryId
      })
    }
  }
}
</script>
