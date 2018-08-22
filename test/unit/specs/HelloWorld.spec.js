import { shallow } from '@vue/test-utils'
import HelloWorld from '@/components/HelloWorld'

describe('HelloWorld.vue', () => {
  let cmp

  beforeEach(() => {
    cmp = shallow(HelloWorld, {
      data: {
        msg: 'This is only a test'
      }
    })
  })
  it('equals messages to ["This is only a test"]', () => {
    // Within cmp.vm, we can access all Vue instance methods
    expect(cmp.vm.msg).toEqual('This is only a test')
  })
  it('should render correct contents', () => {
    expect(cmp.vm.$el.querySelector('.hello h1').textContent)
      .toEqual('This is only a test')
  })
})
