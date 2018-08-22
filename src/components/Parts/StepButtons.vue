<template>
  <v-card-actions class="mb-3">
    <v-btn v-if="backButton" :loading="formLoading" :disabled="formLoading" @click="navigate('back')" color="primary"><v-icon left dark class="hidden-xs-only">arrow_back</v-icon>{{ backButton }}</v-btn>
    <v-spacer v-else></v-spacer>
    <v-spacer></v-spacer>
    <p v-if="top" class="title hidden-xs-only" v-html="title"></p>
    <v-spacer v-if="top"  class="hidden-xs-only"></v-spacer>
    <v-btn v-if="forwardButton" :loading="formLoading" :disabled="!formValid || formLoading" @click="navigate('forward')" color="primary">{{ forwardButton }}<v-icon right dark class="hidden-xs-only">arrow_forward</v-icon></v-btn>
    <v-spacer v-else></v-spacer>
  </v-card-actions>
</template>

<script>
export default {
  props: ['formLoading', 'formValid', 'backButton', 'forwardButton', 'top', 'title'],
  methods: {
    navigate: function (direction) {
      // TODO: warn user if leaving an invalid step
      this.$emit('navigate', direction)
    }
  }
}
</script>
