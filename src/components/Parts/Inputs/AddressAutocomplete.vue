<template>
  <div>
    <vuetify-google-autocomplete
      ref="vgaRef"
      label="Address lookup"
      id="gacID0101"
      append-icon="search"
      placeholder="Enter an address"
      :clearable="true"
      v-on:placechanged="vgaChanged"
      value=""
      types=""
      v-on:no-results-found="vgaNoResults"
    />
  </div>
</template>

<script>
export default {
  methods: {
    vgaChanged (result, place) {
      let self = this
      if (result) {
        this.$emit('changed', {result, place})
        setTimeout(() => {
          self.$refs.vgaRef.update('')
        }, 500)
      }
    },
    vgaNoResults (result) {
      this.$emit('noResult', result)
    }
  }
}
</script>
