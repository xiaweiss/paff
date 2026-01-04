import { emitter, sleep } from '../utils/index'

Component({
  options: {
    pureDataPattern: /^_/,
    virtualHost: true
  },
  data: {
    _editor: null,
    isFocus: false,
    keyboardHeight: 300,
    safeAreaBottom: 0,
  },
  lifetimes: {
    attached () {
      const windowInfo = wx.getWindowInfo()
      this.setData({safeAreaBottom: windowInfo.screenHeight - windowInfo.safeArea.bottom})
    },
  },
  methods: {
    noop () {
      return true
    },
    onEditorReady() {
      const query = this.createSelectorQuery()
      query.select('#editor').context((res) => {
        this.data._editor = res.context

        this.setContent()
      }).exec()
    },
    onTouchStart (e) {
      console.log('onTouchStart', e)
    },
    onFocus (e) {
      // setTimeout(() => {
      //   wx.pageScrollTo({
      //     scrollTop: 0,
      //     duration: 0
      //   })
      // }, 100)

      console.log('onFocus', e)
      this.setData({isFocus: true}, () => {
        this.data._editor.scrollIntoView()
      })
    },
    onBlur (e) {
      console.log('onBlur', e)
      this.setData({isFocus: false})
    },
    async onKeyboardHeightChange (res) {
      const { height, duration } = res

      console.log('onKeyboardHeightChange', res)

      // 获取键盘高度
      if (height > 0 && height !== this.data.keyboardHeight) {
        this.setData({keyboardHeight: height})
      }

      // 键盘弹起后，将上推的页面拉回来
      if (height) {
        await sleep(duration * 1000)
        wx.pageScrollTo({
          scrollTop: 0,
          duration: 0
        })
      }
    },
    setContent () {
      let html = ''

      for (let i = 0; i < 100; i++) {
        html += `<p>${i}</p>`
      }

      this.data._editor.setContents({html})
    },
  }
})
