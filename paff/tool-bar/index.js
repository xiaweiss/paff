import { emitter, isAndroid } from '../../utils/index'

Component({
  options: {
    virtualHost: true,
  },
  properties: {
    isFocus: Boolean
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
    test () {
      this.triggerEvent('test')
    },
    poster () {
      this.triggerEvent('poster')
    },
    blur () {
      this.triggerEvent('blur')
    }
  }
})
