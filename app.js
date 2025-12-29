import { emitter } from './utils/index'
import { component } from './component'

/** 修改全局组件方法，注入一些功能 */
component()

App({
  onLaunch() {
    wx.onKeyboardHeightChange(res => {
      emitter.emit('keyboardHeightChange', res)
    })
  }
})
