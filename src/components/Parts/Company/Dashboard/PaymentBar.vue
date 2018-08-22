<template>
  <v-card class="payment-bar">
    <v-layout align-center justify-space-between row>
      <v-flex>
        <v-card flat>
          <v-card-text subheading>Add a payment method (needed after hiring a candidate)</v-card-text>
        </v-card>
      </v-flex>
      <v-flex>
        <v-card flat>
          <v-btn flat large @click="addPayment">Add Payment</v-btn>
        </v-card>
      </v-flex>
    </v-layout>
  </v-card>
</template>

<script>
export default {
  methods: {
    addPayment: function () {}
  }
}
</script>

<style lang="scss">
.payment-bar .layout > * {
  flex-grow: 0;
}
</style>
