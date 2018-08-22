<template>
  <v-container fluid grid-list-lg>
    <v-layout row wrap>
      <v-flex xs12 sm6>
        <h1>Available hours</h1>
        <h2>{{ availableHours('edit') }}</h2>
      </v-flex>
      <v-flex xs12 sm6>
        <h1>Available Days</h1>
        <h2>{{ availableDays('edit') }}</h2>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import {mapGetters} from 'vuex'

export default {
  computed: {
    ...mapGetters('expert', ['availableHours', 'availableDays'])
  }
}
</script>
