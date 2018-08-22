<template>
  <div class="text-sm-left">

    <v-btn color="primary" outline @click.native="$router.go(-1)" class="mb-4"><v-icon left>arrow_back</v-icon>Admin dashboard</v-btn>

    <transition name="fade" mode="out-in">
      <review v-if="companyForm && view === 'review'" @navigate="navigate"></review>
      <gigForm v-if="view == 'gigForm'"></gigForm>
      <v-card v-if="!companyForm && !loadFail">
        <v-card-title>
          <h1>Loading company data</h1>
        </v-card-title>
        <v-card-text>
          <v-progress-circular indeterminate :size="50" color="primary"></v-progress-circular>
        </v-card-text>
      </v-card>
    </transition>
    <h1 v-if="loadFail">Unable to load the requested company. Please try again or contact customer service</h1>
  </div>
</template>

<script>
import review from '@/components/Parts/Admin/Company/Review'
import {mapState} from 'vuex'
export default {
  components: {
    review
  },
  data () {
    return {
      view: 'review',
      companyForm: false,
      loadFail: false
    }
  },
  computed: {
    ...mapState('customer', ['customer'])
  },
  methods: {
    handleNetworkError: function (error) {
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
    navigate: function (where) {
      let self = this
      let newView = where || 'review'
      switch (newView) {
        case 'gigForm':
          this.$router.push({name: 'super-company-gig', params: {companyId: self.customer.id}})
          break
        default:
          self.view = newView
          break
      }
    }
  },
  mounted () {
    let self = this
    if (!self.customer.id || self.customer.id !== self.$route.params.companyId) {
      // get the company by id
      self.$store.dispatch('customer/getCustomer', {customerId: self.$route.params.companyId})
        .then(() => {
          self.companyForm = Object.assign({}, self.customer)
        })
        .catch((error) => {
          console.log('one of our promises was not fulfilled', error)
          if (!self.handleNetworkError(error)) {
            self.loadFail = true
          }
        })
    } else {
      self.companyForm = Object.assign({}, self.customer)
    }
    self.$store.dispatch('customerIndustries/getIndustries', {customerId: self.$route.params.companyId})
  }
}
</script>
