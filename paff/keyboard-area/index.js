import { emitter } from '../../utils/index'

Component({
  options: {
    pureDataPattern: /^_/,
    virtualHost: true,
  },
  data: {
    safeAreaBottom: 0,
    keyboardHeight: 0,
  },
  pagelifetimes: {
    show () {
      this.setData({ isHide: false })
    },
    hide () {
      this.setData({ isHide: true })
    }
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
    onKeyboardHeightChange (res) {
      if (this.data.isHide) return
      this.setData({ keyboardHeight: res.height })
    }
  }
})
