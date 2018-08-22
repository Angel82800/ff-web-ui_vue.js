<template>
  <v-card>
    <v-toolbar flat>
      <v-toolbar-title>
        {{ title }}
      </v-toolbar-title>
    </v-toolbar>
    <v-card v-show="applicants.length === 0">
      <v-card-title primary-title>
        {{ empty }}
      </v-card-title>
    </v-card>
    <template v-for="(applicant, index) in applicants">
      <v-card :key="index * 2">
        <v-card-title primary-title>
          <v-avatar class="grey mr-3" key="1">
            <v-icon size="48px" dark v-show="avatar(applicant) === 'icon'">account_circle</v-icon>
            <img v-show="avatar(applicant) === 'avatar'" :src="applicant.auth0_avatar" alt="avatar">
            <img v-show="avatar(applicant) === 'photo'" :src="applicant.photo_url" alt="avatar">
          </v-avatar>
          <span class="headline">{{ fullName(applicant) }}</span>
        </v-card-title>
        <v-card-actions>
          <v-btn flat color="blue" @click="$emit('view', applicant.expert_id)">View</v-btn>
          <v-btn v-if="no" flat color="red" @click="$emit('status', {applicant, status: no})">{{ noLabel }}</v-btn>
          <v-btn flat color="green" @click="$emit('status', {applicant, status: yes})">{{ yesLabel }}</v-btn>
        </v-card-actions>
      </v-card>
      <v-divider :key="index * 2 + 1"/>
    </template>
  </v-card>
</template>

<script>
export default {
  props: [
    'applicants',
    'title',
    'empty',
    'no',
    'yes',
    'noLabel',
    'yesLabel'
  ],
  methods: {
    fullName: function (applicant) {
      return applicant.name_first + ' ' + applicant.name_last
    },
    avatar: function (applicant) {
      if (applicant.photo_url !== 'none') {
        if (applicant.photo_url) {
          return 'photo'
        }
        if (applicant.auth0_avatar) {
          return 'avatar'
        }
      }
      return 'icon'
    }
  }
}
</script>
