import { emitter, isIOS } from '../../utils/index'

Component({
  options: {
    virtualHost: true
  },
  data: {
    value: '',
    focus: false,
    isHide: false,
    isFocus: false,
    isIOS: isIOS(),
    keyboardHeight: 0,
    toolBarHeight: 50,
    safeAreaBottom: 0,
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
    },
    onFocus () {
      this.setData({ isFocus: true })
      this.triggerEvent('focus')
    },
    onBlur () {
      this.setData({ isFocus: false })
      this.triggerEvent('blur')

      // hack: 屏幕左滑收起键盘时，需要额外调用一次 blur，下次才能正常 focus
      // if (isIOS()) this.blur()
    },
    focus () {
      if (this.data.isFocus) return
      this.setData({ focus: true })
    },
    blur () {
      if (!this.data.isFocus) return
      this.setData({ focus: false })
    },
    onLineChange (e) {
      const { height, lineCount } = e.detail
      console.log('=====onLineChange', height, lineCount)
    },
    onInput (e) {
      const { value, cursor, keyCode } = e.detail
      console.log('=====onInput', e.detail)
    },
    onConfirm (e) {
      const { value } = e.detail
      console.log('=====onConfirm', value)
    },
  }
})
