<template>
  <v-navigation-drawer class="left-panel-menu" v-model='drawer' fixed clipped app>
    <v-list v-if="hasGroup('Expert')">
      <v-list-tile class="menu-item" to="/expert" @click="hideDrawer">
        <v-btn flat>Home</v-btn>
      </v-list-tile>

      <v-list-tile class="menu-item" to="/expert/profile/4" @click="hideDrawer">
        <v-btn flat>Profile</v-btn>
      </v-list-tile>

      <v-list-tile class="menu-item" @click="logout">
        <v-btn flat>Logout</v-btn>
      </v-list-tile>
    </v-list>
    <v-list v-if="hasGroup('Company Admin')">
      <v-list-tile class="menu-item" to="/company" @click="hideDrawer">
        <v-btn flat>Dashboard</v-btn>
      </v-list-tile>

      <v-list-tile class="menu-item" to="/company/onboarding" @click="hideDrawer">
        <v-btn flat>Company Profile</v-btn>
      </v-list-tile>

      <v-list-tile class="menu-item" to="/company/jobs-management" @click="hideDrawer">
        <v-btn flat>Jobs Overview</v-btn>
      </v-list-tile>

      <v-list-tile class="menu-item" to="/company/candidates-management" @click="hideDrawer">
        <v-btn flat>Candidates Overview {{ newCandidates }}</v-btn>
      </v-list-tile>

      <v-list-tile disabled class="menu-item" to="">
        <v-btn flat>Workforce Overview</v-btn>
      </v-list-tile>

      <v-list-tile class="menu-item" @click="logout">
        <v-btn flat>Logout</v-btn>
      </v-list-tile>
    </v-list>
  </v-navigation-drawer>
</template>

<script>
export default {
  props: ['navigationDrawer'],
  data () {
    return {
      candidates: { new: 0 }
    }
  },
  computed: {
    newCandidates () {
      return this.candidates.new ? `(${this.candidates.new})` : ''
    },
    drawer: {
      get () { return this.navigationDrawer },
      set (value) { this.$emit('update:navigationDrawer', value) }
    }
  },
  methods: {
    hasGroup (group) {
      return this.$store.getters['auth/hasGroup'](group)
    },
    logout: function () {
      this.$ga.event({
        eventCategory: 'Session',
        eventAction:   'Logout',
        eventLabel:    'Button'
      })
      this.$store.dispatch('auth/logout')
      this.$router.replace({name: 'home'})
      this.hideDrawer()
    },
    hideDrawer: function () {
      this.drawer = false
    }
  }
}
</script>

<style lang="scss">
.left-panel-menu .menu-item .list__tile {
  padding: 0 6px;

  &:hover {
    background-color: transparent !important;
  }

  .btn {
    width: 100%;
    height: auto;
    margin: 0;

    .btn__content {
      height: auto;
      padding: 10px 16px;
      text-align: left;
      justify-content: flex-start;
    }
  }
}
</style>
