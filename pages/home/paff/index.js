import { isAndroid } from '../../../utils/index'
import { measureTextWidth } from './measureTextWidth'
import { longText as text } from './longText'
// import { shortText } from './shortText'

Component({
  options: {
    pureDataPattern: /^_/,
    virtualHost: true,
  },
  data: {
    isFocus: false,
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
            source: 'url("https://dev-pub-sdn-001.mowen.cn/fe/assets/font/MiSansLatin-Normal.woff")',
            scopes: ['webview', 'native'],
            success: () => resolve()
          })
        })
      }

      this.setContent(text)
    }
  },
  methods: {
    onTap () {
      console.log('onTap')
      this.focus()
    },
    onEditorReady () {
      this.createSelectorQuery().select('#editor').context((res) => {
        this.setData({ editor: res.context })
      }).exec()
    },
    onFocus () {
      console.log('onFocus')
      this.setData({ isFocus: true })
    },
    onBlur () {
      console.log('onBlur')
      this.setData({ isFocus: false })
    },
    onInput (e) {
      console.log('onInput', e)
    },
    onStatusChange (e) {
      console.log('onStatusChange', e)
    },
    onTouchStart (e) {
      console.log('touchstart', e)
      // this.focus()
    },
    onTouchMove (e) {
      console.log('touchmove', e)
    },
    onTouchEnd (e) {
      console.log('touchend', e)
    },
    focus () {
      if (this.data.isFocus) return
      const { editor } = this.data
      editor.insertText({text: ''})
      editor.getContents({
        success: (res) => {
          console.log('getContents', res)
        }
      })
    },
    setContent (value) {
      const start = Date.now()
      const type = 'P'
      const line = []
      const text = []
      const width = []

      let lineIndex = 0
      let lineWidth = 0
      for (const item of [...value]) {
        text.push(item)
        const _width = measureTextWidth(item)
        width.push(_width)

        lineWidth += _width

        if (lineWidth <= this.data.width) {
          line[lineIndex] = (line[lineIndex] || '') + item
        } else {
          line.push(item)
          lineWidth = _width
          lineIndex += 1
        }
      }
      const content = [{
        type,
        line,
        text,
        width
      }]

      this.setData({ content }, () => {
        const end = Date.now()
        console.log('setContent time', end - start)
        console.log('content', content[0])
      })
    },
    selectionChangeHandler (e) {
      console.log('selectionChangeHandler', e)
    }
  }
})
