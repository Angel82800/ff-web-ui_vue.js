<template>
  <div class="company-dashboard">
    <h1 class="display-1 mb-3 text-md-left">{{ customer.name }} / Welcome back, {{ profileName }}</h1>

    <v-layout class="dashboard-layout mb-3" row wrap>
      <card-item
        title="Company Profile"
        linkTo="/company/onboarding"
        imageSrc="https://cdn.vuetifyjs.com/images/cards/desert.jpg"
        v-bind:descriptions="[`${onboarding}% of onboarding completed`]"
        />
      <card-item
        title="Jobs Overview"
        imageSrc="https://cdn.vuetifyjs.com/images/cards/docks.jpg"
        v-bind:descriptions="[`Posted (${jobs.posted})`, `Archive (${jobs.archive})`, `Draft (${jobs.draft})`, `Closed (${jobs.closed})`]"
        />
      <card-item
        title="Candidates Overview"
        imageSrc="https://cdn.vuetifyjs.com/images/cards/foster.jpg"
        v-bind:descriptions="[`New (${candidates.new})`, `Reviewed (${candidates.reviewed})`, `Rejected (${candidates.rejected})`]"
        />
      <card-item
        title="Workforce Overview"
        imageSrc="https://cdn.vuetifyjs.com/images/cards/halcyon.png"
        v-bind:descriptions="[`Current (${workforce.current})`]"
        />
    </v-layout>
    <payment-bar class="mb-5" />
  </div>
</template>

<script>
export default {
  data () {
    return {
      onboarding: 15,
      jobs:       { posted: 2, archive: 4, draft: 0, closed: 1 },
      candidates: { new: 1, reviewed: 3, rejected: 2 },
      workforce:  { current: 3 }
    }
  },
  components: {
    gigList:    () => import('@/components/Parts/Gigs/GigList.vue'),
    cardItem:   () => import('@/components/Parts/Company/Dashboard/CardItem'),
    paymentBar: () => import('@/components/Parts/Company/Dashboard/PaymentBar')
  },
  computed: {
    customer: function () {
      return this.$store.state.customer.mine
    },
    profile: function () {
      return this.$store.state.userProfile.mine
    },
    profileName: function () {
      return [this.profile.name_first, this.profile.name_last].filter(name => name).join(' ')
    }
  },
  methods: {
    postGig: function () {
      this.$router.push({ name: 'company-gig-post' })
    },
    buildProfile: function () {
      this.$router.push({ name: 'company-onboarding' })
    }
  }
}
</script>

<style>
.company-dashboard .dashboard-layout {
  margin-left: -8px;
}
</style>
