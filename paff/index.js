import { emitter, sleep, isIOS } from '../utils/index'

// 编辑器实例，props 传给子组件无法调用
let editor = null

Component({
  options: {
    pureDataPattern: /^_/,
    virtualHost: true
  },
  data: {
    isFocus: false,
    isIOS: isIOS(),
    keyboardHeight: 300,
    safeAreaBottom: 0,
    formats: {}
  },
  lifetimes: {
    attached () {
      const windowInfo = wx.getWindowInfo()
      this.setData({safeAreaBottom: windowInfo.screenHeight - windowInfo.safeArea.bottom})
    },
    detached () {
      editor = null
    }
  },
  methods: {
    noop () {
      return true
    },
    onEditorReady() {
      const query = this.createSelectorQuery()
      query.select('#editor').context((res) => {
        editor = res.context

        this.setContent()
      }).exec()
    },
    onStatusChange(e) {
      const formats = e.detail
      this.setData({ formats })
    },
    onTouchStart (e) {
      console.log('onTouchStart', e)
    },
    onFocus (e) {
      console.log('onFocus', e)
      // setTimeout(() => {
      //   wx.pageScrollTo({
      //     scrollTop: 0,
      //     duration: 0
      //   })
      // }, 100)

      this.setData({isFocus: true}, () => {
        editor.scrollIntoView()
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

      html += `<p>这是一个富文本编辑器，长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长</p>`

      html += `<a href="https://example.com">超链接</a>`

      for (let i = 0; i < 100; i++) {
        html += `<p>${i}</p>`
      }

      editor.setContents({html})
    },

    bold () {
      editor.format('bold')
    },

    save () {
      console.log('save')
      editor.blur()
      editor.getContents({
        success: (res) => {
          console.log('getContents success', res)
        },
        fail: (err) => {
          console.error('getContents fail', err)
        }
      })
    }
  }
})
