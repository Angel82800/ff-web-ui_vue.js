<template>
  <v-layout class="search-filter" align-center justify-space-between row>
    <v-flex>
      <v-card class="search-filter" flat>
        <v-text-field
          v-model="search"
          prepend-icon="search"
          label="Search for a job posting..."
          class="search pa-0"
          flat single-line hide-details
        />
      </v-card>
    </v-flex>

    <v-flex class="shrink">
      <v-card flat>
        <v-btn flat class="text-transform-none" @click="clearSearch">Clear search filter</v-btn>
      </v-card>
    </v-flex>
  </v-layout>
</template>

<script>
export default {
  props: ['search'],
  methods: {
    clearSearch () {
      this.search = ''
    }
  }
}
</script>

<style lang="scss">
.search-filter {
  .search label {
    top: auto;
  }
  .text-transform-none {
    text-transform: none;
  }
}
</style>
