<template>
  <v-card class="mt-3">
    <v-toolbar flat>
      <v-toolbar-title>
        Users
      </v-toolbar-title>
    </v-toolbar>
    <v-container grid-list-sm>
      <v-layout row wrap>
        <v-flex xs12 sm9 class="text-xs-center text-sm-right">
          <v-form v-on:submit.prevent="searchUsers('search')">
            <v-text-field
              name="name"
              label="Search users by name"
              hint="Full or last name. Hit ENTER key."
              v-model="searchQueryForm.name"
              append-icon="search"
            >
            </v-text-field>
            <a href="/super/user?action=none">Advanced search</a>
          </v-form>
        </v-flex>
        <v-flex xs12 sm3 class="text-xs-center text-sm-left mt-2">
          <v-btn color="primary" v-html="searchQueryForm.name ? 'Clear' : 'Browse'" @click="actionUser"></v-btn>
        </v-flex>
      </v-layout>
    </v-container>
  </v-card>
</template>

<script>
import {mapState} from 'vuex'

const deact = (obj) => {
  let flat = Array.isArray(obj) ? [] : {}
  if (typeof obj === 'object') {
    try {
      flat = JSON.parse(JSON.stringify(obj))
    } catch (e) {
      throw e
    }
  }
  return flat
}

export default {
  data () {
    return {
      searchQueryForm: {}
    }
  },
  computed: {
    ...mapState('userProfile', ['searchQuery'])
  },
  methods: {
    searchUsers: function (action) {
      this.$store.commit('userProfile/setSearchQuery', this.searchQueryForm)
      this.$router.push({path: `/super/user/?action=${action}`})
    },
    actionUser: function () {
      if (this.searchQueryForm.name) {
        // clears search text
        this.searchQueryForm.name = ''
        this.$store.commit('userProfile/setUsers', [])
      } else {
        // do browse action
        this.searchUsers('browse')
      }
    }
  },
  mounted () {
    this.searchQueryForm = deact(this.searchQuery)
  }
}
</script>
