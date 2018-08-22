<template>
  <v-card class="jobs-management pa-3">
    <v-dialog
      v-model="dialog"
      max-width="290"
    >
      <v-card>
    <v-card-title class="headline">Warning</v-card-title>

    <v-card-text>
      Are you sure you want to delete this job posting? Once deleted, it cannot be restored
    </v-card-text>

    <v-card-actions>
      <v-spacer></v-spacer>

      <v-btn
        color="green darken-1"
        flat="flat"
        @click="dialog = false"
      >
        Disagree
      </v-btn>

      <v-btn
        color="green darken-1"
        flat="flat"
        @click="dialog = false"
      >
        Agree
      </v-btn>
    </v-card-actions>
  </v-card>
</v-dialog>
    <v-card-title class="pa-0">
      <h2 class="headline">Jobs Management</h2>
    </v-card-title>

    <v-layout class="jobs-actions mt-2" align-center justify-space-between row>
      <v-flex>
        <v-text-field
          label="Search for a job posting"
          prepend-icon="search"
          v-model="search"
          single-line
        ></v-text-field>
      </v-flex>

      <v-flex class="shrink">
        <v-card flat>
          <v-btn flat color="green" @click="clearBtn">Clear search filter</v-btn>
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
          <v-card-text class="pr-2">
            <span>job postings</span>
            <span class="pa-1">({{paginationPageStart + 1}}-{{paginationPageStop}}) out of {{pagination.totalItems}}</span>
          </v-card-text>
        </v-card>
      </v-flex>

      <v-flex class="shrink">
        <v-card flat>
          <flat-pagination v-model="pagination.page" :length="paginationPages" circle />
        </v-card>
      </v-flex>
    </v-layout>

    <v-layout wrap>
      <v-flex xs12 sm12 class="clear" style="justify-content: flex-start;">
        <p style="margin:0px">Filter by status</p>&nbsp;&nbsp;&nbsp;
        <v-btn-toggle v-model="toggle_multiple" multiple style="box-shadow:none;background-color:transparent;">
          <v-btn color="success" class="toggle">
            All({{ originJobs.length }})
          </v-btn>
          <v-btn color="success" class="toggle" >
            Active({{ getActiveLength }})
          </v-btn>
          <v-btn color="success" class="toggle">
            In Progress({{ getProgressLength }})
          </v-btn>
          <v-btn color="success" class="toggle">
            Completed({{ getCompletedLength }})
          </v-btn>
          <v-btn color="success" class="toggle">
            Draft({{ getDraftLength }})
          </v-btn>
        </v-btn-toggle>
      </v-flex>
    </v-layout>

    <v-data-table
      :search="search"
      :headers="headers"
      :items="jobs"
      :pagination.sync="pagination"
      class="jobs-table mt-2 elevation-1"
      disable-initial-sort
      hide-actions
      :loading="dataLoading"
    >
      <template slot="items" slot-scope="props">
        <td class="id text-xs-center" v-text="props.item.id?props.item.id:'- -'" />

        <td class="category text-xs-left">
          <!-- <h5 class="category-name subheading" v-text="props.item.category?props.item.category:'- -'" />
          <p class="created-by ma-0">Created by {{props.item.createdBy?props.item.createdBy:'- -'}}</p> -->
          <div v-html="props.item.category?props.item.category:'- -'"></div>

          <v-menu class="category-actions" content-class="category-actions-content" attach>
            <v-card class="activator transparent" slot="activator" flat>
              <v-btn flat>
                <span>Manage</span>
                <v-icon>arrow_drop_down</v-icon>
              </v-btn>
            </v-card>

            <v-list>
              <v-list-tile>
                <v-btn flat :to="getUrl(props.item.id)" :disabled="checkDraftStatus(props.item.status)">Post job</v-btn>
              </v-list-tile>
              <v-list-tile>
                <v-btn :to="getUrl(props.item.id)" flat>View</v-btn>
              </v-list-tile>
              <v-list-tile>
                <v-btn flat to='/company/gig/post' :disabled="checkDraftStatus(props.item.status)">Edit</v-btn>
              </v-list-tile>
              <v-list-tile>
                <v-btn @click="dialog = true" flat>Delete</v-btn>
              </v-list-tile>
              <v-list-tile>
                <v-btn flat :disabled="checkCompletedStatus(props.item.status)" to='/company/gig/post'>Repost</v-btn>
              </v-list-tile>
            </v-list>
          </v-menu>
        </td>

        <td class="status text-xs-center" v-text="props.item.status?props.item.status:'- -'" />
        <td class="date text-xs-center" v-text="props.item.date?props.item.date:'- -'" />
        <td class="candidates-count text-xs-center" v-text="props.item.candidatesCount?props.item.candidatesCount:'- -'" />
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

      headers: [
        { text: 'Job ID', value: 'id', class: 'id text-xs-center' },
        { text: 'Expert Category', value: 'category', class: 'category text-xs-left' },
        { text: 'Status', value: 'status', class: 'status text-xs-center' },
        { text: 'Date', value: 'date', class: 'date text-xs-center' },
        { text: 'Candidates', value: 'candidatesCount', class: 'candidatesCount text-xs-center' }
      ],

      jobs: [],
      originJobs: [],

      pagination: {
        sortBy: 'id',
        descending: false,
        rowsPerPageList: [10, 25, 50],
        rowsPerPage: 25
      },

      toggle_multiple: [0],
      toggle_flag: true,
      dataLoading: false,
      dialog: false
    }
  },

  computed: {
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

    ...mapState('customerGigs', ['gigsStatusCounts']),

    getActiveLength () {
      var num = 0
      this.jobs.forEach(item => {
        if (item.status.toLowerCase() === 'active') num++
      })
      return num
    },
    getProgressLength () {
      var num = 0
      this.jobs.forEach(item => {
        if (item.status.toLowerCase() === 'in progress') num++
      })
      return num
    },
    getCompletedLength () {
      var num = 0
      this.jobs.forEach(item => {
        if (item.status.toLowerCase() === 'completed') num++
      })
      return num
    },
    getDraftLength () {
      var num = 0
      this.jobs.forEach(item => {
        if (item.status.toLowerCase() === 'draft') num++
      })
      return num
    }
  },

  watch: {
    paginationData: function (data) {
      this.gigsSortedByData = data
    },

    search: function () {
      localStorage.setItem('jobSearch', this.search)
    },

    toggle_multiple: function () {
      if (this.toggle_multiple[this.toggle_multiple.length - 1] === 0 && this.toggle_flag === true) {
        this.toggle_multiple = [0]
        this.toggle_flag = false
        this.setInit()
      } else {
        if (this.toggle_multiple.indexOf(0) !== -1 && !(this.toggle_multiple[0] === 0 && this.toggle_multiple.length === 1)) {
          this.toggle_multiple.splice(this.toggle_multiple.indexOf(0), 1)
        }
        this.setFilter()
        if (this.toggle_multiple.length === 0) {
          this.toggle_multiple = [0]
          this.setInit()
        }
        this.toggle_flag = true
      }
      localStorage.setItem('toggle_multiple', JSON.stringify(this.toggle_multiple))
    }
  },

  methods: {

    getUrl (item) {
      return '/company/gig/post/' + item
    },

    checkDraftStatus (status) {
      if (status.toLowerCase() === 'draft') {
        return false
      } else {
        return true
      }
    },

    checkCompletedStatus (status) {
      if (status.toLowerCase() === 'completed') {
        return false
      } else {
        return true
      }
    },

    clearSearch () {
      this.search = ''
    },

    clearBtn () {
      this.search = ''
    },

    moment: function (date) {
      return moment(date)
    },

    setInit () {
      this.jobs = this.originJobs
    },

    setFilter () {
      this.jobs = []
      if (this.toggle_multiple.indexOf(0) !== -1) {
        this.jobs = this.originJobs
      } else {
        this.originJobs.forEach(item => {
          if (this.toggle_multiple.indexOf(1) !== -1 && item.status.toLowerCase() === 'active') {
            this.jobs.push(item)
          } else if (this.toggle_multiple.indexOf(2) !== -1 && item.status.toLowerCase() === 'in progress') {
            this.jobs.push(item)
          } else if (this.toggle_multiple.indexOf(3) !== -1 && item.status.toLowerCase() === 'completed') {
            this.jobs.push(item)
          } else if (this.toggle_multiple.indexOf(4) !== -1 && item.status.toLowerCase() === 'draft') {
            this.jobs.push(item)
          }
        })
      }
    }
  },

  mounted () {
    let self = this
    let promises = []

    // self.$store.dispatch('customer/getCustomer', {customerId: 32})
    // .then((res) => {
    //   debugger
    //   console.log(res)
    // })
    // .catch((error) => {
    //   console.log('one of our promises was not fulfilled', error)
    // })
    this.dataLoading = true
    promises.push(self.$store.dispatch('customerGigs/getGigs_new'))
    promises.push(self.$store.dispatch('customerGigs/getGigsStatusCounts'))

    Promise.all(promises)
      .then((res) => {
        self.originJobs = self.$store.state.customerGigs.gigs.map(function (value, index) {
          return {
            // id: id, category: `category ${id}`, createdBy: 'Tom Jones', status: `status ${id}`, date: moment(new Date()).format('MM/DD/YYYY'), candidatesCount: id + 1
            id: value.id, category: `<h5 class="category-name subheading">${value.categoryTitle}</h5><p class="created-by ma-0">Created by </p>`, status: value.status, date: moment(value.create_ts).format('MM/DD/YYYY'), candidatesCount: (self.$store.state.customerGigs.gigsStatusCounts[index] && self.$store.state.customerGigs.gigsStatusCounts[index].total)? self.$store.state.customerGigs.gigsStatusCounts[index].total:'- -'
          }
        })
        var toggle = [0]
        if (localStorage) {
          toggle = JSON.parse(localStorage.getItem('toggle_multiple'))
        }
        self.toggle_multiple = toggle
        self.search = localStorage.getItem('jobSearch')
        self.setInit()
      })
      .catch((error) => {
        console.error(error)
      })
      .finally(() => {
        this.dataLoading = false
      })
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
.jobs-management {
  text-align: left;
  .card__text {
    text-align: left
  }
  .clear {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .toggle {
    margin-right: 1vw;
    color: white!important;
  }

  .jobs-actions {
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

  .jobs-table .table__overflow {
    overflow: visible;

    .table {
      .id, .status, .date, .candidates-count {
        width: 1px;
        white-space: nowrap;
      }

      .category .category-actions {
        .menu__activator .btn {
          margin: 0;
        }

        .category-actions-content {
          top: auto !important;
          margin-top: 1px;
        }

        .list .list__tile {
          height: auto;
          padding: 0;

          .btn {
            width: 100%;
            margin: 0 6px;
          }
        }
      }
    }
  }
}
</style>
