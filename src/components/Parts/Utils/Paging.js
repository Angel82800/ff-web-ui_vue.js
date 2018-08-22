// See vuetify/src/mixins/data-iterable.js

export default {
  data () {
    return {
      pagination: {
        rowsPerPage: 5,
        rowsPerPageList: [
          5, 10, 25,
          { text: 'All', value: -1 }
        ]
      }
    }
  },
  computed: {
    paginationPages () {
      if (this.pagination.totalItems == null) return 0
      if (this.pagination.rowsPerPage === -1) return 1
      return Math.ceil(this.pagination.totalItems / this.pagination.rowsPerPage)
    },
    paginationPageStart () {
      if (this.pagination.totalItems == null || this.pagination.page == null) return 0
      return (this.pagination.page - 1) * this.pagination.rowsPerPage
    },
    paginationPageStop () {
      if (this.pagination.totalItems == null) return 0
      if (this.pagination.rowsPerPage === -1) return this.pagination.totalItems
      return Math.min(this.paginationPageStart + this.pagination.rowsPerPage, this.pagination.totalItems)
    }
  }
}
