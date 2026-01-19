import { emitter } from './utils/index'
import { component } from './component'

/** 修改全局组件方法，注入一些功能 */
component()

const globalData = {
  systemInfo: undefined,
}

App({
  globalData,
  onLaunch() {
    const systemInfo = wx.getSystemInfoSync()
    this.globalData.systemInfo = systemInfo

    wx.onKeyboardHeightChange(res => {
      emitter.emit('keyboardHeightChange', res)
    })
  }
})
