<template>
  <div>
    <address-autocomplete @changed="addressChanged" @noResult="addressNull"/>
    <v-text-field label="Company name" v-model="name" />
    <v-text-field label="Street" v-model="street1" />
    <v-text-field label="City" v-model="city" />
    <v-text-field label="State" v-model="state" />
    <v-text-field label="Zip code" v-model="postalCode" />
  </div>
</template>

<script>
export default {
  data () {
    return {
      name: '',
      street1: '',
      city: '',
      state: '',
      postalCode: '',
      latitude: '',
      longitude: ''
    }
  },
  components: {
    addressAutocomplete: () => import('@/components/Parts/Inputs/AddressAutocomplete')
  },
  computed: {
    hasAddress () {
      return this.street1 || this.city || this.state || this.postalCode
    }
  },
  methods: {
    addressChanged (data) {
      this.name = ''
      if (data.place.name !== `${data.place.address_components[0].short_name} ${data.place.address_components[1].short_name}`) {
        this.name = data.place.name
      }
      this.street1 = `${data.result.street_number} ${data.result.route}`
      this.city = data.result.locality
      this.state = data.result.administrative_area_level_1
      this.postalCode = data.result.postal_code
      this.latitude = data.result.latitude
      this.longitude = data.result.longitude
    },
    addressNull (data) {
      console.log('no adress result', data)
    }
  }
}
</script>
