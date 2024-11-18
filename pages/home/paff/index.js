// import { isAndroid } from '../../../utils/index'
// import { longText as text } from './longText'
import { shortText as text } from './shortText'

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
    measureText: '',
  },
  lifetimes: {
    async attached () {
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
      const p = content[0]
      const { line } = p

      for (let i = 0; i < line.length; i++) {
        if (y === line[i].top) {
          cursorY = line[i].top

          console.log('===start', line[i].textIndex)

          let left = 0
          for (let j = line[i].textIndex; j < p.width.length; j++) {
            const right = left + p.width[j]
            const center = (left + right) / 2

            console.log('x', x)
            console.log('left', left, 'center', center, 'right', right)

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
    measureTextWidth (text) {
      return new Promise((resolve) => {
        this.setData({ measureText: text }, () => {
          const query = this.createSelectorQuery()
          query.select('.measure-text').boundingClientRect((rect) => {
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
