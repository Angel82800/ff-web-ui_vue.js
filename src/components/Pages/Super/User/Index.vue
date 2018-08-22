<template>
  <div>
    <h1>User management</h1>
    <v-container grid-list-sm>
      <v-layout row wrap>
        <v-flex xs12 sm7 class="text-xs-center text-sm-right">
          <v-form v-on:submit.prevent="searchUsers()">
            <v-text-field
              name="name"
              label="Search users by name"
              hint="Full or last name. Hit ENTER key."
              v-model="searchQueryFormUsers.name"
              append-icon="search"
              :disabled="loading"
              :loading="loading"
            >
            </v-text-field>
          </v-form>
        </v-flex>
        <v-flex xs12 sm5 class="text-xs-center text-sm-left mt-2">
          <v-btn color="primary" :disabled="loading" :loading="loading" v-html="searchQueryFormUsers.name || (users.length || experts.length) ? 'Clear' : 'Browse'" @click="buttonAction"></v-btn>
          <v-tooltip left v-if="experts.length">
            <v-btn color="primary" :disabled="loading" slot="activator" @click="downloadCSV">
              <v-icon left color="gray">save_alt</v-icon>
              CSV
            </v-btn>
            <span>Download CSV of prospects</span>
          </v-tooltip>
        </v-flex>
        <v-flex xs12 md4>
          <v-select
            :loading="loading"
            v-model="searchQueryFormExperts.locationId"
            :search-input.sync="autocomplete_company_name"
            label="Within 30 miles of"
            single-line
            item-text="name"
            item-value="locationId"
            :items="customers"
            @input="searchExperts('company')"
            clearable
            auto
            autocomplete
          ></v-select>
        </v-flex>
        <v-flex xs12 md4>
          <v-select
            :loading="loading"
            v-model="searchQueryFormExperts.skill_category_id"
            label="Category"
            single-line
            item-text="title"
            item-value="id"
            :items="expertise.categories"
            @input="searchExperts('category')"
            clearable
            auto
          ></v-select>
        </v-flex>
        <v-flex xs12 md4>
          <v-select
            :loading="loading"
            :disabled="!searchQueryFormExperts.skill_category_id"
            v-model="searchQueryFormExperts.skill_ids"
            label="Skills"
            single-line
            item-text="title"
            item-value="id"
            :items="skillsByCategoryId({categoryId: searchQueryFormExperts.skill_category_id})"
            @input="searchExperts('skill')"
            clearable
            auto
          ></v-select>
        </v-flex>
        <v-flex xs12>
          <div v-for="(detailGroup, index) in detailGroupsBySkillId({skillId: searchQueryFormExperts.skill_ids})" :key="index">
            {{ detailGroup.title }}
            <v-container fluid>
              <v-layout row wrap>
                <v-flex xs12 sm4 md3 v-for="(detail, index) in detailsByGroupId(detailGroup.id)" :key="index">
                  <v-checkbox @change="searchExperts('detail')" :loading="loading" hide-details v-model="searchQueryFormExperts.skill_detail_ids" :label="detail.title" :value="detail.id"></v-checkbox>
                </v-flex>
              </v-layout>
            </v-container>
          </div>
        </v-flex>
      </v-layout>
    </v-container>

    <v-data-table v-if="results.length" :headers="userHeaders" :items="results" :no-data-text="nullResults">
      <template slot="items" slot-scope="props">
        <td v-html="props.item.name_first" class="text-xs-left"></td>
        <td v-html="props.item.name_last" class="text-xs-left"></td>
        <td v-html="props.item.email" class="text-xs-left"></td>
        <td v-html="props.item.create_ts.substr(0, 10)" class="text-xs-left"></td>
        <td v-html="props.item.update_ts.substr(0, 10)" class="text-xs-left"></td>
        <td v-html="props.item.userType" class="text-xs-left"></td>
        <td class="layout px-0">
          <v-btn icon class="mx-0" @click="editItem(props.item.id, props.item.userType)">
            <v-icon color="teal">edit</v-icon>
          </v-btn>
          <v-btn icon class="mx-0" @click="deleteCheck(props.item.id)">
            <v-icon color="pink">delete</v-icon>
          </v-btn>
        </td>
      </template>
    </v-data-table>

    <v-dialog v-model="showUserTypeDialog" max-width="290">
      <v-card>
        <v-card-title class="headline">Assign user type</v-card-title>
        <v-card-text>
          What kind of user would you like to make {{ editName }}?
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn :disabled="settingUserType" color="green darken-1" flat @click.native="setUserType('Expert')">Expert</v-btn>
          <v-btn :disabled="settingUserType" color="green darken-1" flat @click.native="setUserType('Company Admin')">Company Admin</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="showDeleteDialog" persistent max-width="290">
      <v-card>
        <v-card-title class="headline">Delete user</v-card-title>
        <v-card-text>
          A you certain you want to delete the {{ deleteType }}, {{ deleteName}}?
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="green darken-1" flat @click.native="deleteId = 0">Cancel</v-btn>
          <v-btn color="green darken-1" flat @click.native="deleteConfirmed()">Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="companyWarning" persistent max-width="290">
      <v-card>
        <v-card-title class="headline">Company Admin</v-card-title>
        <v-card-text>
          Company Admin functions are not yet available
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="green darken-1" flat @click.native="companyWarning = false">continue</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
export default {
  props: ['action'],
  data () {
    return {
      deleteId: 0,
      companyWarning: false,
      setUserTypeId: 0,
      settingUserType: false,
      searchQueryFormUsers: {},
      searchQueryFormExperts: {},
      userHeaders: [
        {
          text: 'First name',
          align: 'left',
          sortable: true,
          value: 'name_first'
        },
        {
          text: 'Last name',
          align: 'left',
          sortable: true,
          value: 'name_last'
        },
        {
          text: 'Email',
          align: 'left',
          sortable: true,
          value: 'email'
        },
        {
          text: 'Created',
          align: 'left',
          sortable: true,
          value: 'create_ts'
        },
        {
          text: 'Updated',
          align: 'left',
          sortable: true,
          value: 'update_ts'
        },
        {
          text: 'Type',
          align: 'left',
          sortable: true,
          value: 'userType'
        },
        {
          text: 'Actions',
          align: 'left',
          sortable: false
        }
      ],
      loading: false,
      autocomplete_company_name: null
    }
  },
  computed: {
    showDeleteDialog: function () {
      return this.deleteId > 0
    },
    showUserTypeDialog: {
      get: function () {
        return this.setUserTypeId > 0
      },
      set: function (val) {
        this.setUserTypeId = val ? this.setUserTypeId : 0
      }
    },
    editUser: function () {
      let user = {type: '', name: ''}
      for (let i = 0; i < this.users.length; i++) {
        if (this.users[i].id === this.setUserTypeId) {
          return this.users[i]
        }
      }
      return user
    },
    deleteUser: function () {
      let user = {type: '', name: ''}
      for (let i = 0; i < this.users.length; i++) {
        if (this.users[i].id === this.deleteId) {
          return this.users[i]
        }
      }
      return user
    },
    deleteType: function () {
      return this.deleteUser.userType
    },
    deleteName: function () {
      return this.deleteUser.name_first + ' ' + this.deleteUser.name_last
    },
    editName: function () {
      return this.editUser.name_first + ' ' + this.editUser.name_last
    },
    nullResults: function () {
      return this.loading ? 'Search in progress' : 'No results match your request'
    },
    results: function () {
      if (this.searchType === 'users') {
        return this.users
      }
      let res = []
      for (let i = 0; i < this.experts.length; i++) {
        res.push(Object.assign({}, this.experts[i]))
        res[i].userType = 'Expert'
      }
      return res
    },
    searchType () {
      // check out the current state of search query forms to determine which kind of search to conduct/results to show
      if (this.searchQueryFormExperts['skill_category_id'] || this.searchQueryFormExperts['locationId']) {
        return 'experts'
      }
      // account for 'browse' action collecting users without having any search criteria
      if (this.users.length || this.searchQueryFormUsers['name']) {
        return 'users'
      }
      return 'none'
    },
    ...mapState('userProfile', {users: 'users', searchQueryUsers: 'searchQuery'}),
    ...mapState('expert', {experts: 'experts', searchQueryExperts: 'searchQuery'}),
    ...mapState('vars', ['expertise']),
    ...mapState('customer', ['customers']),
    ...mapGetters('userProfile', ['getUserById']),
    ...mapGetters('vars', ['skillsByCategoryId', 'skillsByIdsByCategoryId', 'detailGroupsBySkillId', 'detailsByGroupId', 'cleanedAlphaName'])
  },
  methods: {
    handleNetworkError (error) {
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
    searchUsers () {
      let self = this
      self.loading = true
      this.$store.commit('expert/setSearchQuery', {})
      this.$store.dispatch('userProfile/getUsers', {query: self.searchQueryFormUsers})
        .catch((error) => {
          self.handleNetworkError(error)
        })
        .finally(() => {
          self.loading = false
        })
    },
    searchExperts (which) {
      let self = this
      switch (which) {
        case 'skill':
          self.searchQueryFormExperts.skill_detail_ids = []
          break
        case 'category':
          self.searchQueryFormExperts.skill_ids = []
          self.searchQueryFormExperts.skill_detail_ids = []
          break
      }
      if (self.searchQueryFormExperts.skill_category_id || self.searchQueryFormExperts.locationId) {
        // make sure the selected skill belongs to the selcted category and isn't left over from a previous selection
        let skillIds = []
        let skills = self.skillsByIdsByCategoryId({categoryId: self.searchQueryFormExperts.skill_category_id, skills: [{skill_id: self.searchQueryFormExperts.skill_ids}]})
        for (let i = 0; i < skills.length; i++) {
          skillIds.push(skills[i].id)
        }

        self.searchQueryFormUsers.name = ''
        let query = {
          skill_category_id: self.searchQueryFormExperts.skill_category_id,
          skill_ids: skillIds,
          skill_detail_ids: self.searchQueryFormExperts.skill_detail_ids,
          locationId: self.searchQueryFormExperts.locationId
        }
        self.$store.dispatch('expert/search', {query})
      } else {
        this.$store.commit('expert/setExperts', [])
      }
    },
    buttonAction: function () {
      if (this.searchQueryFormUsers.name || this.results.length) {
        this.setSearchForms(true)
        this.$store.commit('userProfile/setUsers', [])
        this.$store.commit('expert/setExperts', [])
      } else {
        // do browse action
        this.setSearchForms(true)
        this.searchUsers()
      }
    },
    editItem: function (userProfileId, type) {
      let self = this
      switch (type) {
        case 'Expert':
          // send me to the expert edit page
          self.$router.push({'name': 'super-expert', params: {userProfileId}})
          break
        case 'Company Admin':
          self.companyWarning = true
          break
        default:
          self.setUserTypeId = userProfileId
      }
    },
    deleteCheck: function (userProfileId) {
      let self = this
      self.deleteId = userProfileId
    },
    deleteConfirmed: function () {
      let self = this
      this.$store.dispatch('userProfile/deleteProfile', {userProfileId: self.deleteId})
        .catch((error) => {
          self.handleNetworkError(error)
        })
      self.deleteId = 0
    },
    setUserType: function (type) {
      let self = this
      if (type === 'Expert') {
        self.settingUserType = true
        self.$store.dispatch('auth/updateGroup', { userProfileId: self.setUserTypeId, groupId: type, auth0SubId: self.getUserById(self.setUserTypeId).auth0_sub_id })
          .catch(function (error) {
            // set alert
            self.$store.dispatch('alerts/publish', {text: `Your request was not processed fully.\n Please try again or contact support.`})
            console.error(error)
          })
          .finally(function () {
            self.setUserTypeId = 0
            self.settingUserType = false
          })
      } else {
        self.setUserTypeId = 0
        self.companyWarning = true
      }
    },
    setSearchForms: function (clear) {
      if (clear) {
        this.$store.commit('expert/setSearchQuery', {})
        this.$store.commit('userProfile/setSearchQuery', {})
      }
      this.searchQueryFormUsers = Object.assign({}, this.searchQueryUsers)
      this.searchQueryFormExperts = Object.assign({}, this.searchQueryExperts)
      if (this.searchQueryFormExperts.skill_ids.length) {
        this.searchQueryFormExperts.skill_ids = this.searchQueryFormExperts.skill_ids[0]
      }
    },
    downloadCSV: function () {
      let self = this
      let rows = []
      let row = []
      let headers = []
      let csvContent = 'data:text/csv;charset=utf-8,'
      Object.keys(self.experts[0]).forEach((key) => {
        headers.push(key)
      })
      rows.push(headers)
      for (let i = 0; i < self.experts.length; i++) {
        row = []
        Object.keys(self.experts[i]).forEach((key) => {
          row.push(self.experts[i][key])
        })
        rows.push(row)
      }
      rows.forEach(function (rowArray) {
        csvContent += rowArray.join(',') + `\r\n`
      })
      const link = document.createElement('a')
      link.href = encodeURI(csvContent)
      link.setAttribute('download', 'expertsearch_' + new Date() + '.csv')
      document.body.appendChild(link)
      link.click()
      link.parentNode.removeChild(link)
    },
    companySearch: function (name) {
      let self = this
      self.loading = true
      self.$store.dispatch('customer/search', {query: {name}})
        .catch((error) => {
          self.handleNetworkError(error)
        })
        .finally(() => {
          self.loading = false
        })
    }
  },
  mounted () {
    this.setSearchForms()
    if (this.action === 'browse' || this.searchType === 'users') {
      this.searchUsers()
    } else if (this.searchType === 'experts') {
      this.searchExperts()
    }
  },
  watch: {
    autocomplete_company_name (val) {
      val && this.companySearch(val) // if there is a val, search it
    }
  }
}
</script>
