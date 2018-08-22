// People can provide better solution in future
// https://github.com/vuetifyjs/vuetify/issues/2541

import VPagination from 'vuetify/es5/components/VPagination'
import VBtn from 'vuetify/es5/components/VBtn'
import VIcon from 'vuetify/es5/components/VIcon'

export default {
  name:    'flat-pagination',
  extends: VPagination,
  methods: {
    genIcon (h, icon, disabled, fn) {
      return h(
        'li',
        [
          h(
            VBtn,
            {
              props: {
                disabled,
                icon: true,
                flat: true
              },
              on: disabled ? {} : { click: fn }
            },
            [h(VIcon, [icon])]
          )
        ]
      )
    },
    genItems () {}
  }
}
