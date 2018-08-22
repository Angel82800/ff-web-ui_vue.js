<template>
  <div>
    <v-container>
      <v-layout row>
        <v-flex xs-12 md-8 lg-6>
          <v-card>
            <v-card-title>
              <h2>
                Gig list
              </h2>
              <v-spacer></v-spacer>
              <v-select
                v-model="statusFilter"
                label="Status filter"
                single-line
                append-icon="search"
                :items="statusFilterItems"
              ></v-select>
            </v-card-title>
            <!-- TODO: put transitions on list so deletes are smoother and the result more obvious -->
            <v-data-table :headers="tableHeaders" :items="gigs" :no-data-text="noDataText">
              <template slot="items" slot-scope="props">
                <td class="text-xs-left">
                  {{ categoryTitle(props.item.skill_category_id) }}
                </td>
                <td class="text-xs-left">
                  {{ props.item.status }}
                </td>
                <td class="text-xs-left">
                  {{ props.item.applicantCount }}
                </td>
                <td class="layout px-0">
                  <v-btn icon class="mx-0" @click="editItem(props.item)" v-if="gigEditable(props.item.status)">
                    <v-icon color="teal">edit</v-icon>
                  </v-btn>
                  <v-btn icon class="mx-0" v-else>
                    <v-icon color="teal">search</v-icon>
                  </v-btn>
                  <v-btn icon class="mx-0" @click="deleteCheck(props.item.id)" :disabled="gigNonDeletable(props.item.status)">
                    <v-icon color="pink">delete</v-icon>
                  </v-btn>
                </td>
              </template>
            </v-data-table>
            <v-dialog v-model="deleteId" persistent max-width="290">
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
        </v-flex>
      </v-layout>
    </v-container>
  </div>
</template>

<script>
import {mapState, mapGetters} from 'vuex'
export default {
  data () {
    return {
      deleteId: 0,
      tableHeaders: [
        {
          text: 'Category',
          align: 'left',
          sortable: false,
          value: 'category'
        },
        { text: 'Status', value: 'status', sortable: false },
        { text: '# Applicants', value: 'applicantCount', sortable: false },
        { text: 'Actions', value: 'actions', sortable: false }
      ],
      statusFilterItems: [
        {text: 'All'},
        {text: 'Draft'},
        {text: 'Review'},
        {text: 'Live'},
        {text: 'Filled'},
        {text: 'Expired'},
        {text: 'Complete'}
      ]
    }
  },
  computed: {
    statusFilter: {
      get: function () {
        return this.statusFilterItems.find((item) => {
          return item.text === this.listStatus[0].toUpperCase() + this.listStatus.substring(1)
        })
      },
      set: function (newStatus) {
        this.$store.commit('customerGigs/setListStatus', {newStatus: newStatus.text.toLowerCase()})
      }
    },
    noDataText: function () {
      switch (this.myDataInitStatus) {
        case true:
          return 'No gigs found'
        case false:
        default:
          return 'Gig data loading'
      }
    },
    gigs: function () {
      if (this.$store.getters['auth/hasGroup']('Super Admin')) {
        return this.adminGigsByStatus
      }
      return this.gigsByStatus
    },
    ...mapState('customerGigs', ['listStatus', 'myDataInitStatus']),
    ...mapGetters('vars', ['categoriesById']),
    ...mapGetters('customerGigs', ['gigsByStatus', 'gigById'])
  },
  methods: {
    handleNetworkError: function (error) {
      // TODO: turn this into a plugin
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
    editItem: function (item) {
      let nextRoute = 'company-gig-post'
      if (this.$store.getters['auth/hasGroup']('Super Admin')) {
        nextRoute = 'super-gig-post'
      }
      this.$router.push({name: nextRoute, params: { gigId: item.id }})
    },
    deleteCheck: function (gigId) {
      this.deleteId = gigId
    },
    deleteJob: function () {
      let gig = this.gigById(this.deleteId)
      this.$store.dispatch('customerGigs/removeGig', {gig})
        .catch((error) => {
          this.handleNetworkError(error)
        })
      this.deleteDialog = false
    },
    gigEditable: function (status) {
      // only drafts can be edited
      if (status === 'draft') {
        return true
      }
      return false
    },
    gigNonDeletable: function (status) {
      // don't allow active gigs to be deleted
      if (status === 'filled') {
        return true
      }
      return false
    },
    categoryTitle: function (categoryId) {
      return (categoryId !== '0' && this.categoriesById({ categoryIds: [categoryId] }).length) ? this.categoriesById({ categoryIds: [categoryId] })[0].title : 'None selected'
    }
  }
}
</script>
