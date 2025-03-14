import { emitter, isAndroid } from '../../utils/index'

Component({
  options: {
    virtualHost: true,
  },
  properties: {
    status: Object
  },
  data: {
    isAndroid: isAndroid(),
    toolBarHeight: 50,
    keyboardHeight: 0,
    safeAreaBottom: 0
  },
  lifetimes: {
    attached () {
      this.setData({ safeAreaBottom: getApp().globalData.safeAreaBottom })
      this.onKeyboardHeightChange = this.onKeyboardHeightChange.bind(this)
      emitter.on('keyboardHeightChange', this.onKeyboardHeightChange)
    },
    detached () {
      emitter.off('keyboardHeightChange', this.onKeyboardHeightChange)
    }
  },
  methods: {
    noop () {},
    onKeyboardHeightChange (res) {
      this.setData({ keyboardHeight: res.height })
    },
    command (e) {
      const { command } = e.currentTarget.dataset
      this.triggerEvent('command', {command})
    }
  }
})
