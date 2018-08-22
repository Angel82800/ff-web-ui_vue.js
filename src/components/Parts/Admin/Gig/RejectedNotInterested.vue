<template>
 <v-card class="mt-3">
    <v-toolbar flat>
      <v-toolbar-title>
        Rejected/Not interested
      </v-toolbar-title>
    </v-toolbar>
    <v-data-table v-if="outApplicants.length" :headers="applicantHeaders" :items="outApplicants" :no-data-text="nullResults">
      <template slot="items" slot-scope="props">
        <td v-html="props.item.name_first" class="text-xs-left"></td>
        <td v-html="props.item.name_last" class="text-xs-left"></td>
        <td v-html="props.item.email" class="text-xs-left"></td>
        <td class="layout px-0">
          <v-btn icon class="mx-0" @click="expertView(props.item.id)">
            <v-icon color="teal">search</v-icon>
          </v-btn>
          <v-btn icon class="mx-0" @click="expertToNotified(props.item)">
            <v-icon color="pink">undo</v-icon>
          </v-btn>
        </td>
      </template>
    </v-data-table>
  </v-card>
</template>

<script>
import { mapState } from 'vuex'
export default {
  props: ['gigForm', 'searchFilter'],
  data () {
    return {
      notifyApplicant: false,
      applicantHeaders: [
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
    outApplicants () {
      return this.applicants.filter((applicant) => {
        return (applicant.status === 'Rejected' || applicant.status === 'Not interested')
      })
    },
    notifyName: function () {
      let expert = this.experts.find((expert) => {
        return expert.id === this.notifyId
      })
      return (expert ? expert.name_first + ' ' + expert.name_last : '')
    },
    nullResults: function () {
      return this.loading ? 'Loading applicants' : 'No applicants match your request'
    },
    ...mapState('adminGigs', ['applicants'])
  },
  methods: {
    expertView: function (id) {
      this.$emit('getExpert', id)
      // Get the expert view and show a notify/"mark as notified" button
    },
    expertToNotified: function (applicant) {
      let self = this
      applicant = Object.assign({}, applicant)
      applicant.status = 'Notified'
      self.$store.dispatch('adminGigs/putApplicant', {applicant})
        .catch((error) => {
          self.$emit('network', error)
        })
    }
  }
}
</script>
