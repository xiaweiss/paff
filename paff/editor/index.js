import { emitter } from '../utils/index'

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

      this.keyboardHeightChange = this.keyboardHeightChange.bind(this)
      emitter.on('keyboardHeightChange', this.keyboardHeightChange)
    },
    detached () {
      emitter.off('keyboardHeightChange', this.keyboardHeightChange)
    },
  },
  methods: {
    onEditorReady() {
      const query = this.createSelectorQuery()
      query.select('#editor').context((res) => {
        this.data._editor = res.context

        this.setContent()
      }).exec()
    },
    keyboardHeightChange (res) {
      console.log('keyboardHeightChange', res)
      if (res.height !== this.data.keyboardHeight) {
        // this.setData({keyboardHeight: res.height})
        const duration = res.height > 0 ? res.duration * 1000 : 0

        setTimeout(() => {
          wx.pageScrollTo({
            scrollTop: 0,
            duration: 0
          })
        }, duration)
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
