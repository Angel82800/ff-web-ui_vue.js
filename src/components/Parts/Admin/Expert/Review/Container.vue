<template>
  <div>
    <v-card v-if="(!expertForm || !profileForm) && !loadFail">
      <v-card-title>
        <h1>Loading expert data</h1>
      </v-card-title>
      <v-card-text>
        <v-progress-circular indeterminate :size="50" color="primary"></v-progress-circular>
      </v-card-text>
    </v-card>
    <v-card flat v-if="!loadFail && expertForm && profileForm">
      <v-card-actions>
        <v-spacer />
        <v-btn color="primary" outline @click.native="getPDF" class="mb-4">Print résumé<v-icon right>print</v-icon></v-btn>
      </v-card-actions>
      <v-card class="elevation-3 mb-3 mx-1">
        <v-toolbar dark color="grey" @click="setView('form-basic')" class="pointer">
          <v-toolbar-title class="headline white--text">Basic info</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-icon>edit</v-icon>
        </v-toolbar>
        <v-card-text>
          <v-container fluid grid-list-lg>
            <v-layout row wrap>
              <v-flex xs12 sm5 md3>
                <v-avatar tile size="128px" class="grey" key="1">
                  <v-icon size="128px" dark v-show="avatar === 'icon'">account_circle</v-icon>
                  <img v-show="avatar === 'avatar'" :src="profileForm.auth0_avatar" alt="avatar">
                  <img v-show="avatar === 'photo'" :src="expertForm.photo_url" alt="avatar">
                </v-avatar>
              </v-flex>
              <v-flex xs12 sm7 md9>
                <h1>{{ profileForm.name_first + ' ' + profileForm.name_last }}</h1>
                <h2>{{ expertForm.phone }}</h2>
                <h2>{{ profileForm.email }}</h2>
                <h2>{{ expertForm.street1 }}</h2>
                <h2>{{ expertForm.city + ', ' + expertForm.state + ' ' + expertForm.postalCode }}</h2>
              </v-flex>
            </v-layout>
          </v-container>
        </v-card-text>
      </v-card>
      <v-card class="elevation-3 mb-3 mx-1">
        <v-toolbar dark color="grey" @click="setView('form-expertise')" class="pointer">
          <v-toolbar-title class="headline white--text">Expertise</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-icon>edit</v-icon>
        </v-toolbar>
        <v-card-text>
          <review-expertise></review-expertise>
        </v-card-text>
      </v-card>
      <v-card class="elevation-3 mb-3 mx-1 pb-3">
        <v-card-text class="pb-0">
          <div class="headline">Expertise comments</div>
          <span class="grey--text">Visible to companies, but not to experts</span>
          <v-text-field
            textarea
            :disabled="processing"
            v-model="expertForm.comment_resume_skills"
          ></v-text-field>
        </v-card-text>
        <v-card-actions class="py-0 mr-3">
          <v-spacer />
          <v-btn outline :loading="processing" :disabled="processing" color="primary" @click="saveComments">Save</v-btn>
        </v-card-actions>
      </v-card>
      <v-card class="elevation-3 mb-3 mx-1 pb-3">
        <v-toolbar flat @click="setView('form-history')" class="pointer">
          <v-toolbar-title>
            Employment history
          </v-toolbar-title>
          <v-spacer></v-spacer>
          <v-icon>edit</v-icon>
        </v-toolbar>
        <v-card-text>
          <review-history :userId="profileForm.id"></review-history>
        </v-card-text>
      </v-card>
      <v-card class="elevation-3 mb-3 mx-1 pb-3">
        <v-card-text class="pb-0">
          <div class="headline">Employment history comments</div>
          <span class="grey--text">Visible to companies, but not to experts</span>
          <v-text-field
            textarea
            :disabled="processing"
            v-model="expertForm.comment_resume_history"
          ></v-text-field>
        </v-card-text>
        <v-card-actions class="py-0 mr-3">
          <v-spacer />
          <v-btn outline :loading="processing" :disabled="processing" color="primary" @click="saveComments">Save</v-btn>
        </v-card-actions>
      </v-card>
      <v-card class="elevation-3 mb-3 mx-1 pb-3">
        <v-card-text class="pb-0">
          <div class="headline">Education history</div>
          <span class="grey--text">Visible to companies, but not to experts (for now)</span>
          <v-text-field
            textarea
            :disabled="processing"
            v-model="expertForm.comment_resume_education"
          ></v-text-field>
        </v-card-text>
        <v-card-actions class="py-0 mr-3">
          <v-spacer />
          <v-btn outline :loading="processing" :disabled="processing" color="primary" @click="saveComments">Save</v-btn>
        </v-card-actions>
      </v-card>
      <!-- Not currently in use
      <v-card class="elevation-3 mb-3 mx-1 pb-3">
        <v-toolbar dark color="grey" @click="setView('form-availability')" class="pointer">
          <v-toolbar-title class="headline white--text">Availability</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-icon>edit</v-icon>
        </v-toolbar>
        <v-card-text>
          <review-availability></review-availability>
        </v-card-text>
      </v-card> -->
    </v-card>
    <div v-if="loadFail">
      Data loading failure
    </div>
  </div>
</template>

<script>
import reviewExpertise from '@/components/Parts/Admin/Expert/Review/Expertise'
import reviewHistory from '@/components/Parts/Admin/Expert/Review/History'
import reviewAvailability from '@/components/Parts/Admin/Expert/Review/Availability'

export default {
  props: ['loadFail', 'profileForm', 'expertForm'],
  components: {
    reviewExpertise,
    reviewHistory,
    reviewAvailability
  },
  data () {
    return {
      processing: false
    }
  },
  computed: {
    avatar: function () {
      if (this.expertForm.photo_url !== 'none') {
        if (this.expertForm.photo_url) {
          return 'photo'
        }
        if (this.profileForm.auth0_avatar) {
          return 'avatar'
        }
      }
      return 'icon'
    }
  },
  methods: {
    setView: function (view) {
      this.$emit('setView', view)
    },
    saveComments: function () {
      let self = this
      self.processing = true
      self.$store.dispatch('expert/updateExpert', { expert: self.expertForm })
        .finally(() => {
          self.processing = false
        })
    },
    getPDF: function () {
      this.$store.dispatch('expert/getPDF')
    }
  }
}
</script>
