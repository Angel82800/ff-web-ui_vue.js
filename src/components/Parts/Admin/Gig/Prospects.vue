<template>
 <v-card class="mt-3">
    <v-toolbar flat>
      <v-toolbar-title>
        Prospects
      </v-toolbar-title>
      <v-spacer />
      <v-switch
        :label="`Skill detail criteria: ${searchFilterModel ? 'On' : 'Off'}`"
        v-model="searchFilterModel"
        color="primary"
        class="mt-4"
      ></v-switch>
      <v-tooltip left v-if="experts.length">
        <v-btn slot="activator" icon @click="downloadCSV">
          <v-icon color="gray">save_alt</v-icon>
        </v-btn>
        <span>Download CSV of prospects</span>
      </v-tooltip>
    </v-toolbar>
    <v-data-table v-if="experts.length" :headers="expertHeaders" :items="experts" :no-data-text="nullResults">
      <template slot="items" slot-scope="props">
        <td v-html="props.item.name_first" class="text-xs-left"></td>
        <td v-html="props.item.name_last" class="text-xs-left"></td>
        <td v-html="props.item.email" class="text-xs-left"></td>
        <td class="layout px-0">
          <v-btn icon class="mx-0" @click="expertView(props.item.id)">
            <v-icon color="teal">search</v-icon>
          </v-btn>
          <v-tooltip v-if="isApplicant(props.item.id)" bottom>
            <v-btn slot="activator" icon class="mx-0" >
              <v-icon color="grey">check</v-icon>
            </v-btn>
            <span>Expert has been notified</span>
          </v-tooltip>
          <v-btn v-else icon class="mx-0" @click="expertNotify(props.item)">
            <v-icon color="pink">add_alert</v-icon>
          </v-btn>
        </td>
      </template>
    </v-data-table>
    <v-dialog v-model="showNotifyDialog" persistent max-width="290">
      <v-card>
        <v-card-title class="headline">Notify prospect</v-card-title>
        <v-card-text>
          Would you like to mark {{ notifyName }} as having been notified?
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="green darken-1" flat @click.native="notifyId = 0">Cancel</v-btn>
          <v-btn color="green darken-1" flat @click.native="notifyConfirmed()">Notify</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script>
import { mapState } from 'vuex'
export default {
  props: ['gigForm', 'searchFilter'],
  data () {
    return {
      notifyApplicant: false,
      expertHeaders: [
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
          text: 'Actions',
          align: 'left',
          sortable: false
        }
      ],
      loading: false
    }
  },
  computed: {
    searchFilterModel: {
      get: function () {
        return this.searchFilter
      },
      set: function (val) {
        this.$emit('setFilter', val)
      }
    },
    notifyName: function () {
      let expert = this.experts.find((expert) => {
        return expert.id === this.notifyId
      })
      return (expert ? expert.name_first + ' ' + expert.name_last : '')
    },
    showNotifyDialog: function () {
      return (this.notifyApplicant !== false)
    },
    nullResults: function () {
      return this.loading ? 'Loading prospects' : 'No prospects match your request'
    },
    ...mapState('expert', ['experts']),
    ...mapState('adminGigs', ['applicants'])
  },
  methods: {
    expertView: function (id) {
      this.$emit('getExpert', id)
      // Get the expert view and show a notify/"mark as notified" button
    },
    expertNotify: function (expert) {
      // bring up dialog to ask whether to notify the expert (mark as notified for now -- will email/SMS later)
      this.notifyApplicant = Object.assign({}, expert)
      this.notifyApplicant.id = null
      this.notifyApplicant.gig_id = this.gigForm.id
      this.notifyApplicant.expert_id = expert.id
      this.notifyApplicant.status = 'Notified'
    },
    isApplicant: function (id) {
      // if the user is already in the current pool of applicants, true
      let idx = this.applicants.findIndex((applicant) => {
        return applicant.expert_id === id
      })
      return (idx > -1)
    },
    notifyConfirmed: function () {
      let self = this
      self.$store.dispatch('adminGigs/postApplicant', {applicant: self.notifyApplicant})
        .catch((error) => {
          self.$emit('network', error)
        })
      self.notifyApplicant = false
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
      console.log(link.href)
      link.setAttribute('download', 'gig_' + self.gigForm.id + '.csv')
      document.body.appendChild(link)
      link.click()
      link.parentNode.removeChild(link)
    }
  }
}
</script>
