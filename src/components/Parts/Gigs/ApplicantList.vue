<template>
  <v-layout row wrap>
    <v-flex xs12 md6 lg3>
      <applicant-column :applicants="matches" title="1. Matches" empty="There are no prospects to notify" no="Not interested" no-label="Not interested" yes="Applied" yes-label="Applied" @view="applicantView" @status="setStatus"></applicant-column>
    </v-flex>
    <v-flex xs12 md6 lg3>
      <applicant-column :applicants="reviews" title="2. Review" empty="There are no applicants to review" no="Rejected" no-label="Reject" yes="Interviewed" yes-label="Interview" @view="applicantView" @status="setStatus"></applicant-column>
    </v-flex>
    <v-flex xs12 md6 lg3>
      <applicant-column :applicants="interviews" title="3. Interview" empty="There are no applicants to interview" no="Rejected" no-label="Reject" yes="Offered" yes-label="Offer" @view="applicantView" @status="setStatus"></applicant-column>
    </v-flex>
    <v-flex xs12 md6 lg3>
      <applicant-column :applicants="offers" title="4. Offer" empty="There are no applicants with offers" no="Not interested" no-label="Not interested" yes="Hired" yes-label="Hire" @view="applicantView" @status="setStatus"></applicant-column>
    </v-flex>
  </v-layout>

  <!-- <v-card class="mt-3">
    <v-toolbar flat>
      <v-toolbar-title>
        Applicants
      </v-toolbar-title>
    </v-toolbar>
    <v-data-table v-if="applicants.length" :headers="applicantHeaders" :items="applicants" :no-data-text="nullResults">
      <template slot="items" slot-scope="props">
        <td v-html="props.item.name_first" class="text-xs-left"></td>
        <td v-html="props.item.name_last" class="text-xs-left"></td>
        <td v-html="props.item.status" class="text-xs-left"></td>
        <td class="layout px-0">
          <v-tooltip left>
            <v-btn :disabled="processing(props.item.id)" slot="activator" icon class="mx-0" @click="expertView(props.item.id)">
              <v-icon color="gray">search</v-icon>
            </v-btn>
            <span>View expert info</span>
          </v-tooltip>
          <template v-if="props.item.status === 'Notified'">
            <v-tooltip left>
              <v-btn :disabled="processing(props.item.id)" slot="activator" icon class="mx-0" @click="setStatus(props.item, 'Applied')">
                <v-icon color="teal">check</v-icon>
              </v-btn>
              <span>Submit an application</span>
            </v-tooltip>
            <v-tooltip left>
              <v-btn :disabled="processing(props.item.id)" slot="activator" icon class="mx-0" @click="setStatus(props.item, 'Not interested')">
                <v-icon color="pink">delete</v-icon>
              </v-btn>
              <span>No interested</span>
            </v-tooltip>
          </template>
          <template v-if="props.item.status === 'Applied'">
            <v-tooltip left>
              <v-btn :disabled="processing(props.item.id)" slot="activator" icon class="mx-0" @click="setStatus(props.item, 'Interviewed')">
                <v-icon color="teal">check</v-icon>
              </v-btn>
              <span>Interview set</span>
            </v-tooltip>
            <v-tooltip left>
              <v-btn :disabled="processing(props.item.id)" slot="activator" icon class="mx-0" @click="setStatus(props.item, 'Rejected')">
                <v-icon color="pink">thumb_down</v-icon>
              </v-btn>
              <span>Rejected</span>
            </v-tooltip>
          </template>
          <template v-if="props.item.status === 'Interviewed'">
            <v-tooltip left>
              <v-btn :disabled="processing(props.item.id)" slot="activator" icon class="mx-0" @click="setStatus(props.item, 'Offered')">
                <v-icon color="teal">check</v-icon>
              </v-btn>
              <span>Position offered</span>
            </v-tooltip>
            <v-tooltip left>
              <v-btn :disabled="processing(props.item.id)" slot="activator" icon class="mx-0" @click="setStatus(props.item, 'Hired')">
                <v-icon color="orange">stars</v-icon>
              </v-btn>
              <span>Hired</span>
            </v-tooltip>
            <v-tooltip left>
              <v-btn :disabled="processing(props.item.id)" slot="activator" icon class="mx-0" @click="setStatus(props.item, 'Rejected')">
                <v-icon color="pink">thumb_down</v-icon>
              </v-btn>
              <span>Rejected</span>
            </v-tooltip>
          </template>
          <template v-if="props.item.status === 'Offered'">
            <v-tooltip left>
              <v-btn :disabled="processing(props.item.id)" slot="activator" icon class="mx-0" @click="setStatus(props.item, 'Hired')">
                <v-icon color="orange">stars</v-icon>
              </v-btn>
              <span>Hired!</span>
            </v-tooltip>
            <v-tooltip left>
              <v-btn :disabled="processing(props.item.id)" slot="activator" icon class="mx-0" @click="setStatus(props.item, 'Rejected')">
                <v-icon color="pink">thumb_down</v-icon>
              </v-btn>
              <span>Rejected</span>
            </v-tooltip>
            <v-tooltip left>
              <v-btn :disabled="processing(props.item.id)" slot="activator" icon class="mx-0" @click="setStatus(props.item, 'Not interested')">
                <v-icon color="pink">delete</v-icon>
              </v-btn>
              <span>Not interested</span>
            </v-tooltip>
          </template>
          <template v-if="props.item.status === 'Hired'">
            <v-tooltip left>
              <v-btn :disabled="processing(props.item.id)" slot="activator" icon class="mx-0" @click="setStatus(props.item, 'Rejected')">
                <v-icon color="pink">thumb_down</v-icon>
              </v-btn>
              <span>Rejected</span>
            </v-tooltip>
          </template>
          <template v-if="props.item.status === 'Rejected'">
            <v-tooltip left>
              <v-btn :disabled="processing(props.item.id)" slot="activator" icon class="mx-0" @click="setStatus(props.item, 'Interviewed')">
                <v-icon color="black">undo</v-icon>
              </v-btn>
              <span>Undo rejection</span>
            </v-tooltip>
          </template>
        </td>
      </template>
    </v-data-table>
  </v-card> -->
</template>

<script>
import { mapState } from 'vuex'
import applicantColumn from '@/components/Parts/Gigs/ApplicantColumn'
export default {
  components: {
    applicantColumn
  },
  data () {
    return {
      // nullResults: 'There are no applicants associated with this gig',
      // applicantHeaders: [
      //   {
      //     text: 'First name',
      //     align: 'left',
      //     sortable: true,
      //     value: 'name_first'
      //   },
      //   {
      //     text: 'Last name',
      //     align: 'left',
      //     sortable: true,
      //     value: 'name_last'
      //   },
      //   {
      //     text: 'Status',
      //     align: 'left',
      //     sortable: true,
      //     value: 'status'
      //   },
      //   {
      //     text: 'Actions',
      //     align: 'left',
      //     sortable: false
      //   }
      // ]
    }
  },
  computed: {
    matches () {
      return this.applicants.filter(applicant => {
        return applicant.status === 'Notified'
      })
    },
    reviews () {
      return this.applicants.filter(applicant => {
        return applicant.status === 'Applied'
      })
    },
    interviews () {
      return this.applicants.filter(applicant => {
        return applicant.status === 'Interviewed'
      })
    },
    offers () {
      return this.applicants.filter(applicant => {
        return applicant.status === 'Offered'
      })
    },
    ...mapState('adminGigs', ['applicants'])
  },
  methods: {
    applicantView: function (id) {
      this.$emit('getExpert', id)
    },
    setStatus: function (data) {
      this.$emit('setStatus', data)
    }
  }
}
</script>
