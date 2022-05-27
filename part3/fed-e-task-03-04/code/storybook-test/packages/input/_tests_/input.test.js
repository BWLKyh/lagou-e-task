import input from '../src/input.vue'
import { mount } from '@vue/test-utils'
// jest不需要导入, 因为测试文件是被 jest 执行的
describe('lg-input', () => {
  test('input-text', () => {
    const wrapper = mount(input)
    expect(wrapper.html()).toContain('input type="text"')
  })
  test('input-password', () => {
    const wrapper = mount(input, {
      propsData: {
        type: 'password',
      },
    })
    expect(wrapper.html()).toContain('input type="password"')
  })
  test('input-password-value', () => {
    const wrapper = mount(input, {
      propsData: {
        type: 'password',
        value: 'admin',
      },
    })
    expect(wrapper.props('value')).toBe('admin')
    expect(wrapper.html()).toContain('input type="password"')
  })
  test('input-snapshot', () => {
    const wrapper = mount(input, {
      propsData: {
        type: 'text',
        value: 'admin',
      },
    })
    expect(wrapper.vm.$el).toMatchSnapshot() // 首次执行会生成快照到__snapshots__中, 再次执行时会对比第一次的快照
  })
})
