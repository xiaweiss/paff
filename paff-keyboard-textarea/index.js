import { isIOS, sleep } from '../utils/index'

const app = getApp()

Component({
  options: {
    pureDataPattern: /^_/,
    virtualHost: true,
  },
  data: {
    isFocus: false,
    keyboardHeight: 0,
    safeAreaBottom: 0,
    scrollTop: 0,
  },
  lifetimes: {
    attached() {
      this.setData({safeAreaBottom: app.globalData.safeAreaBottom})

      // this.onKeyboardHeightChange = this.onKeyboardHeightChange.bind(this)
      // emitter.on('keyboardHeightChange', this.onKeyboardHeightChange)
    },
    detached() {
      // emitter.off('keyboardHeightChange', this.onKeyboardHeightChange)
    }
  },
  methods: {
    noop () {},
    onKeyboardHeightChange (e) {
      console.log('========onKeyboardHeightChange', e.detail.height)
      this.setData({keyboardHeight: e.detail.height})
    },
    test () {
      this.setData({isFocus: true})
      this.setData({scrollTop: 10000})
    },
    focus() {
      this.setData({isFocus: true})
    },
    blur() {
      this.setData({isFocus: false})
    },
    async onFocus () {
      console.log('====onFocus', app.globalData.keyboardHeight)
      // this.setData({scrollTop: 10000})
    },
    onBlur () {
      console.log('====onBlur', app.globalData.keyboardHeight)

      if (this.renderer === 'skyline') {
        this.setData({keyboardHeight: 0})
        this.data.isFocus && setTimeout(() => {
          this.setData({isFocus: true})
        }, 100)
      }
    }
  }
})
