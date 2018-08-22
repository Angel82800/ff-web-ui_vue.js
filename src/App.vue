<template>
  <v-app id="app">
    <leftPanelMenu v-if='isAuthenticated' :navigationDrawer.sync="navigationDrawer" />
    <v-toolbar app fixed clipped-left>
      <v-toolbar-side-icon v-if='isAuthenticated' class="ml-3 mr-0" @click="navigationDrawer = !navigationDrawer" />
      <v-toolbar-title>
        <logo />
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-toolbar-items>
        <mainActionsMenu v-if="isAuthenticated" />
        <accountMenu />
      </v-toolbar-items>
    </v-toolbar>
    <v-content>
      <v-container fluid id="mainContainer">
        <transition name="fade" mode="out-in">
          <router-view :authenticated="isAuthenticated" />
        </transition>
      </v-container>
      <v-snackbar
        :timeout="alert.timeout"
        :top="alert.y === 'top'"
        :bottom="alert.y === 'bottom'"
        :right="alert.x === 'right'"
        :left="alert.x === 'left'"
        :multi-line="alert.mode === 'multi-line'"
        :vertical="alert.mode === 'vertical'"
        v-model="alert.active"
      >
        {{ alert.text }}
        <v-btn flat color="pink" @click.native="closeAlert()">close</v-btn>
      </v-snackbar>
    </v-content>
    <v-footer app fixed class="pa-3">
      <div><a href="https://factoryfix.com">FactoryFix</a></div>
      <v-spacer></v-spacer>
      <div>&copy; {{ new Date().getFullYear() }}</div>
    </v-footer>
  </v-app>
</template>

<script>
import {mapGetters} from 'vuex'

export default {
  name: 'App',
  components: {
    mainActionsMenu: () => import('@/components/Parts/Menu/MainActions'),
    accountMenu:     () => import('@/components/Parts/Menu/Account'),
    leftPanelMenu:   () => import('@/components/Parts/Menu/LeftPanel'),
    logo:            () => import('@/components/Parts/Menu/Logo')
  },
  data () {
    return {
      navigationDrawer: false,
      healthMessage:    '',
      alert:            ''
    }
  },
  computed: {
    ...mapGetters('auth', ['isAuthenticated'])
  },
  created () {
    this.alert = this.$store.state.alerts.alert
    // initialize all parameters
    if (this.isAuthenticated) {
      // we are restoring a previous session. go ahead and init stores that depend on an auth
      this.$store.dispatch('auth/initData')
    }
    // add hubspot code
    let hsScript = document.createElement('script')
    hsScript.setAttribute('async', '')
    hsScript.setAttribute('defer', '')
    hsScript.setAttribute('id', 'hs-script-loader')
    hsScript.setAttribute('src', '//js.hs-scripts.com/4346485.js')
    document.body.appendChild(hsScript)
  },
  mounted () {
    this.$intercom.boot({
      vertical_padding: 45
    })
  },
  methods: {
    closeAlert: function () {
      this.$store.dispatch('alerts/close')
    },
    hideNavigationDrawer: function () {
      this.navigationDrawer = false
    }
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
ul.list-style-none {
  list-style: none;
}
.ease-in-out {
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.5, 1);
}
.fade-enter-active, .fade-leave-active {
  transition: opacity .5s;
}
.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
  opacity: 0;
}
@media only screen and (max-width: 465px) {
  .container {
    padding: 4px;
  }
}
.dow {
  width: 51px;
  height: 51px;
  margin: 10px 0 0 0;
}
.dow .icon {
  font-size: 29px;
}
.pointer {
  cursor: pointer;
}
pre {
  white-space: -moz-pre-wrap;
  white-space: -pre-wrap;
  white-space: -o-pre-wrap;
  white-space: pre-line;
}
#mainContainer {
  padding-bottom: 85px !important; /* make room for intercom widget */
}

.jobs-management .container thead tr th:nth-child(1){
  width:5%;
}

.jobs-management .container thead tr th:nth-child(2){
  width:45%;
}

.jobs-management .container thead tr th:nth-child(3){
  width:15%;
}

.jobs-management .container thead tr th:nth-child(4){
  width:25%;
}

.jobs-management .container thead tr th:nth-child(5){
  width:10%;
}
</style>
