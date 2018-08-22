<template>
  <component :is="slug"></component>
</template>

<script>
export default {
  components: {
    PayRate: () => import('../../Parts/Landing/Expert/PayRate')
  },
  computed: {
    slug () {
      return this.$route.params.slug
    }
  },
  beforeCreate () {
    let self = this
    let index = Object.getOwnPropertyNames(this.$options.components).findIndex(prop => {
      return prop === this.$route.params.slug
    })
    if (index === -1) {
      self.$router.replace({name: 'home'})
    }
  }
}
</script>
