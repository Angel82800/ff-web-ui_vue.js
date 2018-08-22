<template>
  <v-card flat>
    <stepButtons @navigate="setStep" :formLoading="formLoading" :formValid="formValid" :backButton="backButton" :forwardButton="forwardButton" :top="true" :title="pageTitle" />

    <p class="title hidden-sm-and-up" v-html="pageTitle"></p>

    <v-container fluid grid-list-md class="mb-3">
      <v-layout row wrap>
        <v-flex xs12 sm6 v-for="(category, index) in expertise.categories" :key="index" d-flex>
          <v-card class="ease-in-out" :color="categoryState(index) ? 'primary': ''" :dark="categoryState(index)" @click.native="toggleCategory(index)">
            <v-card-text>
              <h1>{{ category.title }}</h1>
              <p v-html="category.description"></p>
            </v-card-text>
          </v-card>
        </v-flex>
      </v-layout>
    </v-container>

    <stepButtons @navigate="setStep" :formLoading="formLoading" :formValid="formValid" :backButton="backButton" :forwardButton="forwardButton" :top="false" :title="pageTitle" />
  </v-card>
</template>

<script>
import {mapState} from 'vuex'

export default {
  props: ['categoryForm', 'formLoading', 'pageTitle'],
  components: {
    StepButtons: () => import('@/components/Parts/StepButtons.vue')
  },
  data: () => ({
    backButton: '',
    forwardButton: 'Next',
    newCategories: []
  }),
  computed: {
    formValid: function () {
      for (let i = 0; i < this.newCategories.length; i++) {
        if (this.newCategories[i].selected) {
          return true
        }
      }
      return false
    },
    ...mapState('vars', ['expertise'])
  },
  methods: {
    setStep: function (direction) {
      let newCategory
      for (let i = 0; i < this.newCategories.length; i++) {
        if (this.newCategories[i].selected) {
          newCategory = this.newCategories[i].category_id
        }
      }
      let data = {
        direction,
        newCategory
      }
      this.$emit('process', data)
    },
    toggleCategory: function (index) {
      let changeTo
      if (!this.formLoading) {
        if (index < this.newCategories.length) {
          changeTo = !this.newCategories[index].selected
          if (changeTo) { // we're only allowing one to be selected, so if this is true, the others must be false
            for (let i = 0; i < this.newCategories.length; i++) {
              this.newCategories[i].selected = false
            }
          }
          this.newCategories[index].selected = changeTo
        }
      }
    },
    categoryState: function (index) {
      if (index < this.newCategories.length) {
        return this.newCategories[index].selected
      }
      return false
    }
  },
  mounted () {
    let self = this
    let category
    self.newCategories = []
    for (let i = 0; i < self.expertise.categories.length; i++) {
      category = self.expertise.categories[i]
      self.newCategories.push({
        category_id: category.id,
        title: category.title,
        description: category.description,
        selected: category.id === self.categoryForm
      })
    }
  }
}
</script>
