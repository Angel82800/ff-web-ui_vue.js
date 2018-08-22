<template>
  <v-card class="mt-3">
    <v-toolbar flat>
      <v-toolbar-title>
        Companies
      </v-toolbar-title>
    </v-toolbar>
    <v-container grid-list-lg>
      <v-layout row wrap>
        <v-flex xs12 class="text-xs-center text-sm-right">
          <v-select
            :loading="loading"
            v-model="companyId"
            :search-input.sync="autocomplete_company_name"
            label="Company"
            single-line
            item-text="display"
            item-value="id"
            :items="customerSelectList"
            @input="editItem"
            clearable
            auto
            autocomplete
          ></v-select>
        </v-flex>
      </v-layout>
    </v-container>
  </v-card>
</template>

<script>
import {mapGetters, mapState} from 'vuex'

export default {
  data () {
    return {
      companyId: null,
      loading: false,
      autocomplete_company_name: null
    }
  },
  computed: {
    nullResults: function () {
      return this.loading ? 'Search in progress' : 'No results match your request'
    },
    hasSearchCriteria () {
      let self = this
      return Object.keys(self.searchQueryForm).some((key) => {
        // ignore the situation where the status has been set to all statuses
        if (key === 'status' && self.searchQueryForm[key] && self.searchQueryForm[key].split(',').length > 1) {
          return false
        }
        return (self.searchQueryForm[key])
      })
    },
    ...mapState('customer', ['customers']),
    ...mapGetters('customer', ['customerSelectList'])
  },
  methods: {
    handleNetworkError (error) {
      let self = this
      let status = (error && error.hasOwnProperty('response') && error.response && error.response.hasOwnProperty('status')) ? error.response.status : error.message
      switch (status) {
        case 401:
          // TODO: use alert
          self.$store.dispatch('auth/logout')
          self.$router.replace({name: 'home'})
          return true
        case 'Network Error':
          // TODO: use alert
          console.log('alert', error)
          return false
      }
    },
    searchCompanies: function (name) {
      let self = this
      self.loading = true
      self.$store.dispatch('customer/search', {query: {name}})
        .catch((error) => {
          self.handleNetworkError(error)
        })
        .finally(() => {
          self.loading = false
        })
    },
    editItem: function (companyId) {
      let company = this.customers.find(customer => {
        return customer.id === companyId
      })
      this.$store.commit('customer/setCustomer', company)
      this.$router.push({'name': 'super-company', params: {companyId}})
    }
  },
  mounted () {
    this.companyId = null
  },
  watch: {
    autocomplete_company_name (val) {
      val && this.searchCompanies(val) // if there is a val, search it
    }
  }
}
</script>
