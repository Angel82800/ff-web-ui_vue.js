<template>
  <v-container grid-list-md class="ma-0 input-group">
    <v-layout row wrap>
      <v-flex xs12 :class="(required ? 'required ' : '') + (error.length ? 'error--text ': '') + 'pb-0'">
        {{ label }}
      </v-flex>
      <v-flex xs6 class="dropDetails pt-0">
        <v-select
          :items="months"
          label="Month"
          :disabled="disabled"
          v-model="newMonth"
          :class="!error.length || 'error--text'"
        ></v-select>
      </v-flex>
      <v-flex xs6 class="dropDetails pt-0">
        <v-select
          :items="years"
          label="Year"
          :disabled="disabled"
          v-model="newYear"
        ></v-select>
      </v-flex>
      <v-flex xs12 class="error--text">
        <div class="input-group__details group__details">{{ error }}</div>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
export default {
  props: ['value', 'disabled', 'rules', 'label', 'months', 'years', 'month', 'year', 'required', 'remoteError'],
  data () {
    return {
      newMonth: this.month,
      newYear: parseInt(this.year),
      localError: ''
    }
  },
  computed: {
    error () {
      return (this.remoteError.length) ? this.remoteError : (this.localError) ? this.localError : ''
    }
  },
  methods: {
    validate: function () {
      if (this.newYear && this.newMonth) {
        this.$emit('update', `${this.newYear}-${this.newMonth}`)
        this.localError = ''
        let testDate = `${this.newYear}-${this.newMonth}`
        let res
        for (let i = 0; i < this.rules.length; i++) {
          res = (this.rules[i] && {}.toString.call(this.rules[i]) === '[object Function]') ? this.rules[i](testDate) : this.rules[i]
          if (res !== true) {
            i = this.rules.length
            this.localError = res
          }
        }
      } else {
        this.localError = 'Required.'
      }
    }
  },
  watch: {
    newMonth: function (newMonth, oldMonth) {
      this.validate()
    },
    newYear: function (newYear, oldYear) {
      this.validate()
    }
  }
}
</script>

<style>
  div.dropDetails div.input-group__details {
    display: none
  }
  .required:after {
    content: ' *'
  }
</style>
