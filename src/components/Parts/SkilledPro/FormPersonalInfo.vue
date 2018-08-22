<template>
  <v-card flat>
    <stepButtons @navigate="setStep" :formLoading="formLoading" :formValid="formValid" :backButton="backButton" :forwardButton="forwardButton" :top="true" :title="pageTitle" />

    <p class="title hidden-sm-and-up" v-html="pageTitle"></p>

    <v-container fluid grid-list-xl class="mb-3">
      <v-form v-model="formValid">
        <v-text-field :disabled="formLoading" :rules="[formRules.required]" required name="name_first" label="First Name" type="text" v-model="profileForm.name_first"></v-text-field>
        <v-text-field :disabled="formLoading" :rules="[formRules.required]" required name="name_last" label="Last Name" type="text" v-model="profileForm.name_last"></v-text-field>
        <v-text-field v-if="getEmail" :disabled="formLoading" :rules="[formRules.required, formRules.email]" required  name="email" label="Email" type="text" v-model="profileForm.email"></v-text-field>
        <!-- <v-text-field :disabled="formLoading" :rules="[formRules.required]" required name="phone" label="Phone Number" type="text" v-model="expertForm.phone"></v-text-field> -->
        <v-text-field :disabled="formLoading" :rules="[formRules.required]" required name="postalCode" label="Zip Code" type="text" v-model="expertForm.postalCode"></v-text-field>
      </v-form>
    </v-container>
    <stepButtons @navigate="setStep" :formLoading="formLoading" :formValid="formValid" :backButton="backButton" :forwardButton="forwardButton" :top="false" :title="pageTitle" />
  </v-card>
</template>
<script>
import { mapState } from 'vuex'
export default {
  props: ['formLoading', 'pageTitle', 'profileForm', 'expertForm'],
  components: {
    StepButtons: () => import('@/components/Parts/StepButtons.vue')
  },
  data: () => ({
    formValid: true,
    backButton: 'Back',
    forwardButton: 'Finish!'
  }),
  computed: {
    getEmail: function () {
      if (this.profileForm.auth0_sub_id) {
        // if this is a social profie, we may need an email address added. If it is an Auth0 username/pwd profile, we have their email address ... somewhere
        return this.profileForm.auth0_sub_id.split('|')[0].indexOf('auth0') === -1 && !this.profileForm.email
      }
      return false
    },
    ...mapState('vars', ['formRules'])
  },
  methods: {
    setStep: function (direction) {
      let data = {
        direction
      }
      this.$emit('process', data)
    }
  }
}
</script>
