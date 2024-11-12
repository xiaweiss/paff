import { isAndroid } from '../../../utils/index'
import { measureTextWidth } from './measureTextWidth'
import { longText as text } from './longText'
// import { shortText as text } from './shortText'

Component({
  options: {
    pureDataPattern: /^_/,
    virtualHost: true,
  },
  data: {
    editor: null,
    width: wx.getWindowInfo().windowWidth,
    content: '',
  },
  lifetimes: {
    async attached () {
      // 加载字体
      if (isAndroid()) {
        await new Promise((resolve) => {
          wx.loadFontFace({
            family: 'MiSansLatin',
            source: 'url("https://pub-sdn-001.mowen.cn/fe/assets/mini-note/not-found/comment-not-found.png")',
            scopes: ['webview', 'native'],
            success: () => resolve()
          })
        })
      }
    }
  },
  methods: {
    onEditorReady () {
      this.createSelectorQuery().select('#editor').context((res) => {
        this.setData({ editor: res.context })
        this.setContent(text)
      }).exec()
    },
    onEditorStatusChange (e) {
      console.log('onEditorStatusChange', e.detail)
    },
    setContent (value) {
      const { editor } = this.data
      editor.insertText({
        text: value
      })
    },
    getContents () {
      const { editor } = this.data
      editor.getContents({
        success: (res) => {
          console.log('====getContents', res)
        }
      })
    },
    touchstart (e) {
      console.log('touchstart', e)
    },
    touchmove (e) {
      console.log('touchmove', e)
    },
    touchend (e) {
      console.log('touchend', e)
    },
  }
})
