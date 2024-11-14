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
    cursorX: 0,
    cursorY: 0,
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
    onTap (e) {
      console.log('onTap', e)
      this.focus()
      let cursorX = 0
      let cursorY = 0

      const { content } = this.data
      const { x } = e.detail
      const { offsetTop: y } = e.target

      const { lineTop } = content[0]

      console.log('====y', y)

      for (let i = 0; i < lineTop.length; i++) {
        if (y === lineTop[i]) {
          cursorY = lineTop[i]
          break
        }
      }

      this.setData({ cursorX: x, cursorY })
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
      const lineTop = []
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
          lineTop.push(lineIndex * 260 / 10)
        }
      }
      const content = [{
        type,
        line,
        lineTop,
        text,
        width
      }]

      this.setData({ content }, () => {
        const end = Date.now()
        console.log('setContent time', end - start)
        console.log('====content', content[0])
      })
    },
    selectionChangeHandler (e) {
      console.log('selectionChangeHandler', e)
    }
  }
})
