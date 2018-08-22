<template>
  <v-card class="mt-3">
    <v-toolbar flat>
      <v-toolbar-title>
        Gigs
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn v-if="customerId" flat icon color="primary" @click="addItem()">
        <v-icon>add_circle_outline</v-icon>
      </v-btn>
    </v-toolbar>
    <v-container grid-list-md v-if="!hideFilters">
      <v-layout row wrap>
        <v-flex xs12 md3>
          <v-select
            :loading="loading"
            v-model="searchQueryForm.skill_category_id"
            label="Category"
            single-line
            item-text="title"
            item-value="id"
            :items="expertise.categories"
            @input="updateQuery"
            clearable
            auto
          ></v-select>
        </v-flex>
        <v-flex xs12 md3>
          <v-select
            :loading="loading"
            v-model="searchQueryForm.customer_id"
            :search-input.sync="autocomplete_company_name"
            label="Company"
            single-line
            item-text="name"
            item-value="id"
            :items="customers"
            @input="updateQuery"
            clearable
            auto
            autocomplete
          ></v-select>
        </v-flex>
        <v-flex xs12 md3>
          <v-select
            :loading="loading"
            v-model="searchQueryForm.status"
            label="Status"
            single-line
            :items="gigStatusList"
            @input="updateQuery"
            clearable
            auto
          ></v-select>
        </v-flex>
        <v-flex xs12 md3>
          <v-btn color="primary" :disabled="loading" :loading="loading" v-html="searchQueryForm.skill_category_id || gigs.length ? 'Clear' : 'Browse'" @click="actionGig"></v-btn>
        </v-flex>
      </v-layout>
    </v-container>
    <v-data-table v-if="gigs.length || searchQueryForm.skill_category_id" :headers="headers" :items="gigs" :no-data-text="nullResults">
      <template slot="items" slot-scope="props">
        <td v-html="props.item.categoryTitle" class="text-xs-left"></td>
        <td v-html="props.item.companyName" class="text-xs-left"></td>
        <td v-html="props.item.create_ts.substr(0, 10)" class="text-xs-left"></td>
        <td v-html="props.item.update_ts.substr(0, 10)" class="text-xs-left"></td>
        <td v-html="props.item.status" class="text-xs-left"></td>
        <td class="layout px-0">
          <v-btn icon class="mx-0" @click="editItem(props.item.id)">
            <v-icon color="teal">edit</v-icon>
          </v-btn>
          <v-btn icon class="mx-0" @click="deleteCheck(props.item.id)" :disabled="gigNonDeletable(props.item.status)">
            <v-icon color="pink">delete</v-icon>
          </v-btn>
        </td>
      </template>
    </v-data-table>
    <v-dialog v-model="showDeleteDialog" persistent max-width="290">
      <v-card>
        <v-card-title class="headline">Delete this job?</v-card-title>
        <v-card-text>Deleting a job can not be undone. Do you with to proceed?</v-card-text>
        <v-card-actions>
          <v-btn flat color="primary" @click.native="deleteId = 0">Keep job</v-btn>
          <v-spacer></v-spacer>
          <v-btn flat color="primary" @click="deleteJob()">Delete job</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script>
import {mapState, mapGetters} from 'vuex'

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
  props: ['hideFilters', 'customerId'],
  data () {
    return {
      deleteId: 0,
      searchQueryForm: {},
      browse: false,
      loading: false,
      autocomplete_company_name: null,
      headers: [
        {
          text: 'Gig category',
          align: 'left',
          sortable: true,
          value: 'categoryTitle'
        },
        {
          text: 'Company Name',
          align: 'left',
          sortable: true,
          value: 'companyName'
        },
        {
          text: 'Created',
          align: 'left',
          sortable: true,
          value: 'create_ts'
        },
        {
          text: 'Updated',
          align: 'left',
          sortable: true,
          value: 'update_ts'
        },
        {
          text: 'Status',
          align: 'left',
          sortable: true,
          value: 'status'
        },
        {
          text: 'Actions',
          align: 'left',
          sortable: false,
          value: 'actions'
        }
      ]
    }
  },
  computed: {
    nullResults: function () {
      return this.loading ? 'Search in progress' : 'No results match your request'
    },
    showDeleteDialog: function () {
      return this.deleteId > 0
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
    ...mapState('vars', ['expertise', 'gigStatusList']),
    ...mapState('adminGigs', ['gigs', 'searchQuery']),
    ...mapGetters('adminGigs', ['gigById'])
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
    actionGig: function (wut) {
      // bound to browse/clear button and will perform one of the actions based on which state it is in
      if (this.hasSearchCriteria || this.gigs.length) {
        // clears search criteria
        this.clearSearch()
      } else {
        // do browse action
        this.searchGigs()
      }
    },
    updateQuery: function (wut) {
      if (this.hasSearchCriteria) {
        this.searchGigs()
      } else {
        this.clearSearch()
      }
    },
    clearSearch: function () {
      this.searchQueryForm.skill_category_id = 0
      this.searchQueryForm.customer_id = 0
      this.searchQueryForm.status = 0
      this.$store.commit('adminGigs/setGigs', {gigs: []})
    },
    searchGigs: function () {
      let self = this
      let query = Object.assign({}, self.searchQueryForm)
      self.loading = true
      // drop any 0's
      Object.keys(query).forEach((key) => {
        if (!query[key]) {
          delete query[key]
        }
      })
      this.$store.dispatch('adminGigs/getGigs', {query})
        .catch((error) => {
          self.handleNetworkError(error)
        })
        .finally(() => {
          self.loading = false
        })
    },
    companySearch: function (name) {
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
    editItem: function (gigId) {
      this.$router.push({'name': 'super-gig', params: {gigId}})
    },
    deleteCheck: function (gigId) {
      this.deleteId = gigId
    },
    deleteJob: function () {
      console.log(this.deleteId)
      let gig = this.gigById(this.deleteId)
      this.$store.dispatch('adminGigs/removeGig', {gig})
        .catch((error) => {
          this.handleNetworkError(error)
        })
        .finally(() => {
          this.deleteId = 0
        })
    },
    gigNonDeletable: function (status) {
      // don't allow active gigs to be deleted
      if (status === 'filled') {
        return true
      }
      return false
    },
    addItem: function () {
      this.$emit('add')
    }
  },
  mounted () {
    this.searchQueryForm = deact(this.searchQuery)
    if (this.customerId) {
      this.searchQueryForm.customer_id = this.customerId
      this.searchGigs()
    }
  },
  watch: {
    autocomplete_company_name (val) {
      val && this.companySearch(val) // if there is a val, search it
    }
  }
}
</script>
