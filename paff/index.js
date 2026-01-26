import { emitter, sleep, isIOS } from '../utils/index'
import { editor, registerEditor, registerCommand, unReigsterEditor } from './helper/index'

/** 是否点击了键盘区域 */
let isClickingKeyboardArea = false

Component({
  options: {
    pureDataPattern: /^_/,
    virtualHost: true
  },
  data: {
    ready: false,
    isFocusingg: false,
    isFocus: false,
    isIOS: isIOS(),
    windowHeight: 0,
    keyboardHeight: 390,
    safeAreaBottom: 0,
    formats: {},
    customBlockList: []
  },
  lifetimes: {
    attached () {
      const windowInfo = wx.getWindowInfo()
      this.setData({
        safeAreaBottom: windowInfo.windowHeight - windowInfo.safeArea.bottom,
        windowHeight: windowInfo.windowHeight
      })
    },
    detached () {
      unReigsterEditor()
    }
  },
  methods: {
    noop () {
      return true
    },

    onTouchStart (e) {
      const { clientY } = e.touches[0]
      const { windowHeight, keyboardHeight} = this.data

      isClickingKeyboardArea = clientY > windowHeight - keyboardHeight
    },

    onEditorReady() {
      const query = this.createSelectorQuery()
      query.select('#editor').context(({context: editor}) => {
        registerEditor(editor)
        registerCommand(editor, this)
        this.setData({ ready: true })

        this.setContent()
      }).exec()
    },

    onEditorInput (e) {
      console.log('onEditorInput', e.detail)
    },

    onEditorStatusChange(e) {
      console.log('onStatusChange', e.detail)
      const formats = e.detail
      this.setData({ formats })
    },

    onEditorTouchStart (e) {
      console.log('onEditorTouchStart', e)
    },

    onEditorTouchEnd () {
      this.resetPageTop()
    },

    onFocus (e) {
      console.log('onFocus', e)

      // ios 点击键盘区域时，页面会上推
      // 上推期间隐藏 header，快结束时再显示 header
      if (this.data.isIOS && isClickingKeyboardArea) {
        this.setData({isFocusing: true}, async () => {
          this.resetPageTop()
          this.setData({isFocus: true})
          editor.scrollIntoView()

          await sleep(160)
          this.setData({isFocusing: false})
        })
      } else {
        this.setData({isFocus: true})
        editor.scrollIntoView()
      }
    },

    onBlur (e) {
      console.log('onBlur', e)
      this.setData({isFocus: false})
    },

    async onKeyboardHeightChange (res) {
      const { height } = res

      console.log('onKeyboardHeightChange', res)

      // 获取键盘高度
      if (height > 0 && height !== this.data.keyboardHeight) {
        this.setData({keyboardHeight: height})
      }
    },
    resetPageTop () {
      wx.pageScrollTo({
        scrollTop: 0,
        duration: 0
      })
    },
    setContent () {
      let html = ''

      // html += `<wx-editor-custom-block class="ecb_T4ZHHa"></wx-editor-custom-block>`

      html += `<p>这是一个富文本编辑器，a长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长</p>`

      html += `<p>文本<a foo="bar" style="color:#CC5656;" link="https://example.com" data-foo="https://example.com" data-custom="fooo">超链接</a></p>`


      for (let i = 0; i < 100; i++) {
        html += `<p>${i}</p>`
      }

      editor.setContents({html})
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
