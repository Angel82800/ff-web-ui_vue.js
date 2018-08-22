<template>
  <v-flex class="company-dashboard-card-item" xs12 sm6 md4 pa-2>
    <v-card>
      <v-card-title pa-3 class="justify-center" v-text="title" :to="linkTo" />
      <v-card-media :src="imageSrc" height="200px" />

      <v-layout align-center justify-space-between row>
        <v-flex v-for="text in descriptions" :key="text">
          <v-card flat>
            <v-card-text class="text-xs-center" v-text="text" />
          </v-card>
        </v-flex>
      </v-layout>
    </v-card>
  </v-flex>
</template>

<script>
export default {
  props: {
    'title':        String,
    'linkTo':       String,
    'imageSrc':     String,
    'descriptions': Array
  }
}
</script>

<style>
.company-dashboard-card-item > .card {
  height: 100% !important;
}
</style>
