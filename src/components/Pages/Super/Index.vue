<template>
  <div>
    <h1>Super admin home page</h1>
    <company-search-simple></company-search-simple>
    <user-search-simple></user-search-simple>
    <gig-search-simple></gig-search-simple>
  </div>
</template>

<script>
import {mapState} from 'vuex'
import companySearchSimple from '@/components/Parts/Admin/CompanySearchSimple'
import userSearchSimple from '@/components/Parts/Admin/UserSearchSimple'
import gigSearchSimple from '@/components/Parts/Admin/GigSearchSimple'

export default {
  components: {
    companySearchSimple,
    userSearchSimple,
    gigSearchSimple
  },
  data () {
    return {
      companySearch: '',
      companies: [],
      companyHeaders: [
        {
          text: 'Company name',
          align: 'left',
          sortable: true,
          value: 'name'
        },
        {
          text: 'City',
          align: 'left',
          sortable: true,
          value: 'city'
        },
        {
          text: 'State',
          align: 'left',
          sortable: true,
          value: 'state'
        }
      ],
      statusFilter: '',
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
    ...mapState('userProfile', ['users'])
  },
  methods: {
    searchCompanies: function () {
      this.companies = [
        {name: 'testing company', city: 'Chicago', state: 'IL'},
        {name: 'testing 2', city: 'Milwaukee', state: 'WI'},
        {name: 'testing 3', city: 'Waukegan', state: 'IL'},
        {name: 'testing 4', city: 'St. Louis', state: 'MO'},
        {name: 'testing 5', city: 'Cincinnati', state: 'OH'},
        {name: 'testing 06', city: 'Bend', state: 'OR'},
        {name: 'testing 7', city: 'New York', state: 'NY'}
      ]
    },
    actionCompany: function () {
      if (this.companySearch || this.companies.length) {
        // clears search text
        this.companySearch = ''
        this.companies = []
      } else {
        // do browse action
        this.searchCompanies()
      }
    }
  }
}
</script>
