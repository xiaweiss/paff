import { emitter } from './utils/index'
import { getEditor } from './command/index'

Component({
  options: {
    pureDataPattern: /^_/
  },
  data: {
    isFocus: false,
    keyboardHeight: 300,
    safeAreaBottom: 0,

    content: new Array(10).fill('哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈').join('\n\n'),
    composition: '',
    value: ' ',

    position: 0,
    start: 1,
    end: 1
  },
  lifetimes: {
    attached () {
      // 初始化编辑器
      getEditor(this)

      const windowInfo = wx.getWindowInfo()
      this.setData({safeAreaBottom: windowInfo.screenHeight - windowInfo.safeArea.bottom})

      this.keyboardHeightChange = this.keyboardHeightChange.bind(this)
      emitter.on('keyboardHeightChange', this.keyboardHeightChange)
    },
    detached () {
      emitter.off('keyboardHeightChange', this.keyboardHeightChange)
    }
  },
  observers: {
    isFocus (value) {
      this.data._isFocus.value = value
    }
  },
  methods: {
    noop () {},

    test () {
      this.data._isFocus.value = true
    },

    keyboardHeightChange (res) {
      if (res.height > 0 && res.height !== this.data.keyboardHeight) {
        this.setData({keyboardHeight: res.height})
      }
    },

    tap () {
      this.setData({isFocus: true})
    },
    input (e) {
      console.log('input', JSON.stringify(e.detail))
      const { value } = e.detail
      const { content } = this.data

      // backspace
      if (value === '') {
        this.setData({
          content: content.slice(0, -1),
          start: 0,
          end: 0
        })

        this.setData({value: ' '}, () => {
          this.setData({
            start: 1, end: 1, isFocus: true
          })
        })

      // enter
      } else if (value === ' \n') {
        this.setData({
          content: content + value.slice(1),
          value: ' '
        })

      // other
      } else {
        this.setData({
          content: content + value.slice(1),
          value: ' '
        })
      }
    },
    change (e) {
      console.log('change', JSON.stringify(e.detail))
    },
    focus (e) {
      console.log('focus', JSON.stringify(e.detail))
      if (this.data.isFocus) return
      this.setData({isFocus: true})
    },
    blur (e) {
      console.log('blur', JSON.stringify(e.detail))
      if (!this.data.isFocus) return
      this.setData({isFocus: false})
    },
    confirm (e) {
      console.log('confirm', JSON.stringify(e.detail))
    },
    keyboardheightchange (e) {
      console.log('keyboardheightchange', JSON.stringify(e.detail))
    },
    selectionchange (e) {
      console.log('selectionchange', JSON.stringify(e))
    },
    keyboardcompositionstart (e) {
      console.log('keyboardcompositionstart', JSON.stringify(e))
      this.setData({composition: e.detail.data.slice(1)})
    },
    keyboardcompositionupdate (e) {
      console.log('keyboardcompositionupdate', JSON.stringify(e))
      this.setData({composition: e.detail.data.slice(1)})
    },
    keyboardcompositionend (e) {
      console.log('keyboardcompositionend', JSON.stringify(e))
      this.setData({composition: ''})
    },
    editorInput (e) {
      console.log('editorInput', JSON.stringify(e))

      this.setData({ value: e.detail.text })
    },
    statuschange (e) {
      console.log('statuschange', JSON.stringify(e))
    }
  }
})
