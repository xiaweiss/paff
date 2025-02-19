import { emitter, isAndroid, isIOS, sleep } from '../utils/index'
// import { longText as text } from './longText'
import { shortText as text } from './shortText'

const app = getApp()

Component({
  options: {
    pureDataPattern: /^_/,
    virtualHost: true,
  },
  data: {
    _editor: null,
    _chineseWidth: 0,
    _scrollTop: 0,
    isAndroid: isAndroid(),
    isIOS: isIOS(),
    isFocus: false,
    editor: null,
    scrollTop: 0,
    width: wx.getWindowInfo().windowWidth,
    content: '',
    cursorX: 0,
    cursorY: 0,
    measureText: '',
    keyboardHeight: 0,
    safeAreaBottom: 0,
  },
  lifetimes: {
    attached () {
      this.setData({ safeAreaBottom: app.globalData.safeAreaBottom })
      this.onKeyboardHeightChange = this.onKeyboardHeightChange.bind(this)
      emitter.on('keyboardHeightChange', this.onKeyboardHeightChange)
      this.setContent(text)
    },
    detached () {
      emitter.off('keyboardHeightChange', this.onKeyboardHeightChange)
    }
  },
  methods: {
    noop () {},
    onFocus () {
      this.setData({ isFocus: true })
    },
    onBlur () {
      this.setData({ isFocus: false })
    },
    async test () {
      console.log('test')
      this.focus()
      // this.setData({ scrollTop: 10000 })
      // this.setData({ keyboardHeight: 300 })
    },
    onTouchStart (e) {
      console.log('onTouchStart', e)
    },
    onScroll (e) {
      this.data._scrollTop = e.detail.scrollTop
    },
    onKeyboardHeightChange (res) {
      this.setData({ keyboardHeight: res.height })
    },
    onEditorReady () {
      this.createSelectorQuery().select('.editor').context((res) => {
        this.data._editor = res.context
      }).exec()
    },
    onTap (e) {
      let cursorX = 0
      let cursorY = 0

      const { content } = this.data
      const { x } = e.detail
      const { offsetTop: y } = e.target
      const p = content[0]
      const { line } = p

      for (let i = 0; i < line.length; i++) {
        if (y === line[i].top) {
          cursorY = line[i].top

          // console.log('===start', line[i].textIndex)

          let left = 0
          for (let j = line[i].textIndex; j < p.width.length; j++) {
            const right = left + p.width[j]
            const center = (left + right) / 2

            // console.log('x', x)
            // console.log('left', left, 'center', center, 'right', right)

            if (x >= left && x < center) {
              cursorX = left
              break
            }
            if (x >= center && x < right) {
              cursorX = right
              break
            }

            left = right
          }
          break
        }
      }

      console.log('====cursorX', cursorX),

      this.setData({ cursorX, cursorY })
    },
    onInput (e) {
      console.log('onInput', e)
    },
    onStatusChange (e) {
      console.log('onStatusChange', e)
    },
    onTouchStart (e) {
      console.log('touchstart', e)
    },
    onTouchMove (e) {
      console.log('touchmove', e)
    },
    onTouchEnd (e) {
      console.log('touchend', e)
    },
    focus () {
      console.log('index focus')
      this.selectComponent('#keyboard').focus()
    },
    blur () {
      this.selectComponent('#keyboard').blur()
    },
    measureTextWidth (text) {
      return Promise.resolve(16)

      return new Promise((resolve) => {
        const isChinese = (new RegExp("[\\u4E00-\\u9FFF]+","g")).test(text)

        // 中文字符是固定宽度，无需重复测量
        if (isChinese && this.data._chineseWidth) {
          resolve(this.data._chineseWidth)
          return
        }

        this.setData({ measureText: text }, () => {
          const query = this.createSelectorQuery()
          query.select('.measure-text').boundingClientRect((rect) => {
            if (isChinese) this.data._chineseWidth = rect.width
            resolve(rect.width)
          }).exec()
        })
      })
    },
    async setContent (value) {
      const start = Date.now()
      const type = 'P'
      const line = [{text: '', textIndex: 0, top: 0}]
      const text = []
      const width = []

      let textIndex = 0
      let lineIndex = 0
      let lineWidth = 0
      for (const item of [...value]) {
        text.push(item)
        const _width = await this.measureTextWidth(item)
        width.push(_width)

        lineWidth += _width

        if (lineWidth <= this.data.width) {
          line[lineIndex].text = line[lineIndex].text + item
        } else {
          lineWidth = _width
          lineIndex += 1
          line.push({text: item, textIndex, top: lineIndex * 260 / 10})
        }
        textIndex += 1
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
        console.log('====content', content[0])
      })
    },
    selectionChangeHandler (e) {
      console.log('selectionChangeHandler', e)
    }
  }
})
