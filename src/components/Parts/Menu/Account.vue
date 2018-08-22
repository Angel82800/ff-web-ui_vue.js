<template>
  <v-layout class="account-menu" align-center row fill-height>
    <v-flex>
      <v-card class="login transparent" v-if="!isAuthenticated" flat>
        <v-btn class="hidden-md-and-up has-icon" icon @click="login">
          <v-icon>fingerprint</v-icon>
        </v-btn>
        <v-btn class="hidden-sm-and-down has-text" flat @click="login">Log in</v-btn>
      </v-card>

      <v-menu class="d-block" content-class="logged-in" v-else attach>
        <v-card class="activator transparent" slot="activator" flat>
          <v-btn class="hidden-md-and-up has-icon" icon>
            <v-icon>apps</v-icon>
          </v-btn>
          <v-btn class="hidden-sm-and-down has-text" flat>
            <span>My Account</span>
            <v-icon>arrow_drop_down</v-icon>
          </v-btn>
        </v-card>

        <v-list>
          <v-list-tile v-if="hasGroup('Expert')" to="/expert/profile/4">
            <v-btn class="has-text" flat>Profile</v-btn>
          </v-list-tile>

          <v-list-tile v-if="hasGroup('Super Admin')" @click="getHealth">
            <v-btn class="has-text" flat>Check health</v-btn>
          </v-list-tile>

          <!-- TODO to account management (change password)  -->
          <v-list-tile v-if="hasGroup('Company Admin')" to="/company/onboarding">
            <v-btn class="has-text" flat>Account Management</v-btn>
          </v-list-tile>

          <v-list-tile @click="logout">
            <v-btn class="has-text" flat>Logout</v-btn>
          </v-list-tile>
        </v-list>
      </v-menu>
    </v-flex>
  </v-layout>
</template>

<script>
import axios from 'axios'
import auth0 from '@/apis/auth0'
import {mapGetters} from 'vuex'

const urlBase = location.hostname === '2fers-dev.factoryfix.com'
  ? 'https://ff-app-dev.appspot.com'
  : (location.hostname === 'gigs.factoryfix.com' ? 'https://ff-app-prod.appspot.com' : 'http://localhost:8042')

export default {
  computed: {
    ...mapGetters('auth', ['hasGroup', 'isAuthenticated'])
  },
  methods: {
    login: auth0.login, // comes from 'apis/auth0'
    logout: function () {
      this.$ga.event({
        eventCategory: 'Session',
        eventAction:   'Logout',
        eventLabel:    'Button'
      })
      this.$store.dispatch('auth/logout')
      this.$router.replace({name: 'home'})
    },
    getHealth: function () {
      let self = this
      // this is just here to test authentication through the API endpoint. Otherwise it would be moved to vuex module
      axios.get(`${urlBase}/v2/health`, {headers: {'Authorization': 'Bearer ' + this.$store.state.auth.access_token}})
        .then(response => {
          self.healthMessage = response.data.message
        })
        .catch(({response}) => {
          console.log(response)
          self.healthMessage = response.status
          if (response.status === 401) {
            self.$store.dispatch('auth/logout')
          }
        })
    }
  }
}
</script>

<style lang="scss">
.account-menu {
  .btn {
    &.has-icon .btn__content {
      padding: 6px;
    }
    &.has-text .btn__content {
      padding: 16px;
    }
  }

  .logged-in {
    left: auto !important;
    right: 0;
    top: auto !important;
    margin-top: 7px;

    .list__tile {
      padding: 0 6px;

      &:hover {
        background-color: transparent !important;
      }

      .btn {
        width: 100%;

        .btn__content {
          text-align: left;
          justify-content: flex-start;
        }
      }
    }
  }
}
</style>
