import { emitter } from './paff/utils/index'

App({
  onLaunch() {
    wx.onKeyboardHeightChange(res => {
      emitter.emit('keyboardHeightChange', res)
    })
  }
})
