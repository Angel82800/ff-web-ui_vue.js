<template>
  <div>
    <v-card class="mb-3 mx-1">
      <v-toolbar flat @click="setView('form')" class="pointer">
        <v-toolbar-title>Overview</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-icon>edit</v-icon>
      </v-toolbar>
      <v-card-text>
        <h1>{{ customer.name }}</h1>
        <h2>{{ customer.street1 }}</h2>
        <h2>{{ customer.city }}, {{ customer.state }}</h2>
        <h2>{{ customer.postalCode }}</h2>
        <v-chip v-for="(industryName, index) in industryNames" :key="index">{{ industryName.title }}</v-chip>
      </v-card-text>
    </v-card>
    <gig-search-simple :hideFilters="true" :customerId="customer.id" @add="addGig"></gig-search-simple>
  </div>
</template>

<script>
import {mapState, mapGetters} from 'vuex'
import gigSearchSimple from '@/components/Parts/Admin/GigSearchSimple'
export default {
  components: {
    gigSearchSimple
  },
  computed: {
    industryNames () {
      let industryIds = []
      for (let i = 0; i < this.industries.length; i++) {
        industryIds.push(this.industries[i].industry_id)
      }
      return this.industriesById({industryIds})
    },
    ...mapGetters('vars', ['industriesById']),
    ...mapState('customer', ['customer']),
    ...mapState('customerIndustries', ['industries'])
  },
  methods: {
    addGig () {
      this.$emit('navigate', 'gigForm')
    }
  }
}
</script>
