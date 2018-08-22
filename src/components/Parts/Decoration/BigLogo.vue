<template>
  <img :class="colorClass" :width="width" src="@/assets/img/ff-logo_345x345.png">
</template>

<script>
export default {
  props: ['color', 'width'],
  computed: {
    colorClass () {
      if (this.color === 'gray') {
        return 'grayscale'
      }
    }
  }
}
</script>

<style>
  .grayscale {
    -webkit-filter: grayscale(100%); /* Safari 6.0 - 9.0 */
    filter: grayscale(100%);
    opacity: 0.2;
  }
</style>
