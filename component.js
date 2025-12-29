import { emitter } from './utils/index'

/**
 * 修改全局组件方法，注入一些功能
 */
export const component = () => {
  const $Component = Component
  Component = (options) => {
    const $options = options.options || {}
    // 指定所有 _ 开头的数据字段为纯数据字段
    $options.pureDataPattern = $options.pureDataPattern || /^_/
    // 默认开启虚拟 host
    $options.virtualHost = $options.virtualHost === undefined ? true : $options.virtualHost


    const pageLifetimes = options.pageLifetimes || {}
    const lifetimes = options.lifetimes || {}

    const $attached = lifetimes.attached
    lifetimes.attached = function () {
      // 键盘高度变化
      if (typeof options.methods?.onKeyboardHeightChange === 'function') {
        this.onKeyboardHeightChange = this.onKeyboardHeightChange.bind(this)
        emitter.on('keyboardHeightChange', this.onKeyboardHeightChange)
      }

      $attached?.apply(this)
    }

    const $detached = lifetimes.detached
    lifetimes.detached = function () {
      $detached?.apply(this)

      // 移除监听
      if (typeof this.onKeyboardHeightChange === 'function') emitter.off('keyboardHeightChange', this.onKeyboardHeightChange)
    }

    return $Component({...options, options: $options, pageLifetimes, lifetimes})
  }
}
