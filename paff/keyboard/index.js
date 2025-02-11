import { emitter, isIOS } from '../../utils/index'

Component({
  options: {
    pureDataPattern: /^_/,
    virtualHost: true,
  },
  properties: {
    focus: Boolean,
  },
  observers: {
    focus (focus) {
      if (focus === this.data.isFocus) return
      focus ? this.focus() : this.blur()
    }
  },
  data: {
    _editor: null,
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
      console.log('=====keyboard hide')
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
    onReady (e) {
      this.createSelectorQuery().select('.keyboard').context((res) => {
        this.setData({ _editor: res.context })
      }).exec()
    },
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
      if (isIOS()) this.blur()
    },
    focus () {
      const { _editor } = this.data
      if (_editor) _editor.insertText({text: ''})
    },
    blur () {
      const { _editor } = this.data
      if (_editor) _editor.blur()
    }
  }
})
