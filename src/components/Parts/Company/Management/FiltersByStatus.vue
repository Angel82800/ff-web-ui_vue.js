<template>
  <v-layout class="filters-by-status d-inline-flex mt-2" align-center justify-start row>
    <v-flex class="shrink">
      <v-card flat>
        <v-card-text class="pa-0 mr-1">
          <span>Filter by status</span>
        </v-card-text>
      </v-card>
    </v-flex>

    <v-flex v-for="filter in filtersByStatus" :key="filter.name">
      <v-card flat>
        <v-btn class="item text-transform-none ma-1" :class="{active: isActiveFilter(filter)}" @click="toggleActiveFilter(filter)" flat>
          {{filter.name | capitalize}} {{filter.count}}
        </v-btn>
      </v-card>
    </v-flex>

    <v-flex class="shrink">
      <v-card flat>
        <v-btn class="text-transform-none my-0 ml-1 mr-0" flat>Clear all filters</v-btn>
      </v-card>
    </v-flex>
  </v-layout>
</template>

<script>
export default {
  props: ['statusCounts', 'selectedStatusName'],

  computed: {
    filtersByStatus () {
      if (this.statusCounts.length === 0) {
        return []
      }

      let allStatusCount = 0

      let filters = this.statusCounts.map(function (statusCount) {
        allStatusCount += statusCount.total
        return { name: statusCount.status, count: statusCount.total }
      })

      filters.unshift({ name: 'all', count: allStatusCount })
      return filters
    },

    statusName: {
      get () { return this.selectedStatusName },
      set (value) { this.$emit('update:selectedStatusName', value) }
    }
  },

  methods: {
    isActiveFilter (filter) {
      return this.statusName === filter.name
    },
    toggleActiveFilter (filter) {
      if (this.isActiveFilter(filter)) {
        this.statusName = null
      } else {
        this.statusName = filter.name
      }
    }
  }
}
</script>

<style lang="scss">
@import "./src/assets/styles/colors";

.filters-by-status {
  .item.active {
    background-color: map-get($colors, active-filter) !important;
  }

  .text-transform-none {
    text-transform: none;
  }
}
</style>
