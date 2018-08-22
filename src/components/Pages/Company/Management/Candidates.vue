<template>
  <v-card class="candidates-management pa-3">
    <v-card-title class="pa-0">
      <h2 class="headline">Candidates Management</h2>
    </v-card-title>

    <v-layout class="candidates-actions mt-2" align-center justify-space-between row>
      <v-flex>
        <search-filter :search="search" />
      </v-flex>

      <v-flex class="shrink">
        <v-card flat>
          <v-card-text class="pa-3">
            <span>Show candidates for the following job posting</span>
          </v-card-text>
        </v-card>
      </v-flex>

      <v-flex class="shrink">
        <v-card flat>
          <v-select
            :items="jobPostingTypes"
            v-model="jobPostingType"
            class="jobPostingTypes selectList pa-0"
            attach hide-details
          />
        </v-card>
      </v-flex>

      <v-flex class="shrink">
        <v-card flat>
          <v-card-text class="pa-3">
            <span>Show</span>
          </v-card-text>
        </v-card>
      </v-flex>

      <v-flex class="shrink">
        <v-card flat>
          <v-select
            :items="pagination.rowsPerPageList"
            v-model="pagination.rowsPerPage"
            class="rowsPerPage selectList pa-0"
            attach hide-details
          />
        </v-card>
      </v-flex>

      <v-flex class="shrink">
        <v-card flat>
          <v-card-text>
            <span class="pa-1">({{paginationPageStart + 1}}-{{paginationPageStop}}) out of {{pagination.totalItems}}</span>
            <span>candidates per page</span>
          </v-card-text>
        </v-card>
      </v-flex>

      <v-flex class="shrink">
        <v-card flat>
          <flat-pagination v-model="pagination.page" :length="paginationPages" circle />
        </v-card>
      </v-flex>
    </v-layout>

    <!-- TODO use candidates status counts, selected status name, etc -->
    <filters-by-status
      :statusCounts="gigsStatusCounts"
      :selectedStatusName.sync="gigsSelectedStatusName"
      :sortedByData.sync="gigsSortedByData"
    />

    <v-data-table
      :search="search"
      :headers="headers"
      :items="candidates"
      :pagination.sync="pagination"
      class="candidates-table mt-2 elevation-1"
      hide-actions
    >
      <template slot="items" slot-scope="props">
        <td class="job-posting text-xs-center">
          <a :href="`/job-postings/${props.item.jobPostingId}`">
            #{{props.item.jobPostingId}}
          </a>
          <span v-text="props.item.jobPostingName" />
        </td>

        <td class="candidate text-xs-center">
          <a :href="`/candidates/${props.item.id}`">
            <span v-text="props.item.name" />
            <span v-text="props.item.familyName" v-if="props.item.isHired" />
          </a>
        </td>

        <td class="application-date text-xs-center" v-text="props.item.applicationDate" />

        <td class="summary text-xs-left">
          <v-container class="pa-0 pt-2">
            <v-layout class="company-summary mb-2" v-for="summary in props.item.summaries" :key="summary.companyName" column>
              <v-flex>
                <p class="company-date ma-0">{{summary.fromDate}} - {{summary.toDate}}</p>
              </v-flex>

              <v-flex>
                <label class="company-name-label bold">Company name:</label>
                <span class="company-name" v-text="summary.companyName" />
              </v-flex>

              <v-flex>
                <label class="company-hourly-rate-label bold">Hourly rate:</label>
                <span class="company-hourly-rate" v-text="summary.hourlyRate" />
              </v-flex>
            </v-layout>
          </v-container>
        </td>

        <td class="status text-xs-center" v-text="props.item.status" />
      </template>
    </v-data-table>
  </v-card>
</template>

<script>
import moment from 'moment'
import paging from '@/components/Parts/Utils/Paging'
import { mapState } from 'vuex'

export default {
  data () {
    return {
      search: '',

      jobPostingType: 'All',
      jobPostingTypes: ['All', 'Job Posting', 'Candidate', 'Application Date', 'Summary', 'Status'],

      headers: [
        { text: 'Job Posting', value: 'jobPosting', class: 'jobPosting text-xs-center' },
        { text: 'Candidate', value: 'candidate', class: 'candidate text-xs-center' },
        { text: 'Application Date', value: 'applicationDate', class: 'applicationDate text-xs-center' },
        { text: 'Candidate Summary', value: 'candidateSummary', class: 'candidateSummary text-xs-left' },
        { text: 'Status', value: 'status', class: 'status text-xs-center' }
      ],

      candidates: Array.from(Array(24)).map(function (_value, index) {
        let id = index + 1

        return {
          jobPostingId:     id,
          jobPostingName:   'Welder',
          id:               id,
          name:             'Tom',
          familyName:       'Jones',
          isHired:          false,
          applicationDate:  moment(new Date()).format('YYYY/MM/DD'),
          status:           'New',
          summaries:        Array.from(Array(3)).map(function (_value, index) {
            return {
              companyName: `company ${index}`,
              fromDate:    moment(new Date()).format('YYYY/MM/DD'),
              toDate:      moment(new Date()).format('YYYY/MM/DD'),
              hourlyRate:  5 * index
            }
          })
        }
      }),

      pagination: {
        sortBy:     'jobPosting',
        descending: false
      }
    }
  },

  computed: {
    // TODO use candidates selected status name
    gigsSelectedStatusName: {
      get () { return this.$store.state.customerGigs.gigsSelectedStatusName },
      set (value) {
        this.$store.commit('customerGigs/setGigsSelectedStatusName', { gigsSelectedStatusName: value })
        this.$store.dispatch('customerGigs/getGigs')
      }
    },
    gigsSortedByData: {
      get () { return this.$store.state.customerGigs.gigsSortedByData },
      set (value) {
        this.$store.commit('customerGigs/setGigsSortedByData', { gigsSortedByData: value })
        this.$store.dispatch('customerGigs/getGigs')
      }
    },
    paginationData () {
      return [this.pagination.sortBy, this.pagination.descending]
    },

    // TODO use candidates status counts
    ...mapState('customerGigs', ['gigsStatusCounts'])
  },

  watch: {
    paginationData: function (data) {
      this.gigsSortedByData = data
    }
  },

  mounted () {
    // TODO use candidates status counts
    this.$store.dispatch('customerGigs/getGigsStatusCounts')
  },

  mixins: [paging],
  components: {
    flatPagination:  () => import('@/components/Parts/Utils/FlatPagination'),
    filtersByStatus: () => import('@/components/Parts/Company/Management/FiltersByStatus'),
    searchFilter:    () => import('@/components/Parts/Company/Management/SearchFilter')
  }
}
</script>

<style lang="scss">
.candidates-management {
  text-align: left;

  .candidates-actions {
    .selectList .menu__content {
      top: 100% !important;
      margin-top: 1px;
      max-width: none !important;
      max-height: none !important;

      .list__tile__title {
        text-overflow: initial;
      }
    }

    .pagination .btn {
      margin: 2px;
    }
  }

  .candidates-table .table__overflow {
    overflow: visible;

    .table {
      .job-posting, .candidate, .application-date, .status {
        width: 1px;
        white-space: nowrap;
      }

      .company-summary .bold {
        font-weight: bold;
      }
    }
  }
}
</style>
