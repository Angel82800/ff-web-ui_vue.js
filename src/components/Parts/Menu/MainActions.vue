<template>
  <v-layout class="main-actions-menu" align-center row fill-height>
    <v-flex>
      <v-card class="transparent" flat to="/company/gig/post" v-if="hasGroup('Company Admin')">
        <v-btn class="hidden-md-and-up has-icon" icon>
          <v-icon>work</v-icon>
        </v-btn>
        <v-btn class="hidden-sm-and-down has-text" flat>Post a job</v-btn>
      </v-card>
    </v-flex>
  </v-layout>
</template>

<script>
import {mapGetters} from 'vuex'

export default {
  computed: {
    ...mapGetters('auth', ['hasGroup'])
  }
}
</script>

<style lang="scss">
.main-actions-menu .btn {
  &.has-icon .btn__content {
    padding: 6px;
  }
  &.has-text .btn__content {
    padding: 16px;
  }
}
</style>
