const app = getApp<AppData>()

Component({
  options: {
    pureDataPattern: /^_/,
    virtualHost: true,
  },
  data: {
    composition: '',
    cursorX: 0,
    cursorY: 0,
    isCustomNavigation: false,
    value: ' ',
    focus: false,
    content: '',
  },
  lifetimes: {
    attached () {
    }
  },
  methods: {
    noop () {},
    onTap (e: WechatMiniprogram.TouchEvent) {
      this.setData({
        focus: true,
      })
    },
    onFocus (e: WechatMiniprogram.TextareaFocus) {

    },
    onBlur (e: WechatMiniprogram.TextareaBlur) {

    },
    onLineChange (e: WechatMiniprogram.TextareaLineChange) {

    },
    onInput (e: WechatMiniprogram.Input) {
      const { value } = e.detail
      let { content } = this.data

      console.log('onInput', value)


      // Backspace
      if (value.length === 0) {
        content = content.slice(0, -1)
      } else {
        content += value.slice(1)
      }

      this.setData({
        content,
        composition: '',
        cursorX: this.textWidth(content)
      })

      return ' '
    },
    onKeyboardHeightChange (e: WechatMiniprogram.InputKeyboardHeightChange) {
    },
    onKeyboardCompositionStart (e: any) {
      const { data } = e.detail
      const { content } = this.data

      this.setData({
        composition: data.slice(1),
        cursorX: this.textWidth(content + data.slice(1))
      })
    },
    onKeyboardCompositionUpdate (e: any) {
      const { data } = e.detail
      const { content } = this.data

      this.setData({
        composition: data.slice(1),
        cursorX: this.textWidth(content + data.slice(1))
      })
    },
    onKeyboardCompositionEnd (e: any) {
      const { data } = e.detail
      const { content } = this.data

      this.setData({
        composition: data.slice(1),
        cursorX: this.textWidth(content + data.slice(1))
      })
    },
    measureText () {
      const canvas = wx.createOffscreenCanvas({
        type: '2d',
        width: 100,
        height: 100
      })
      const context = canvas.getContext('2d')
      context.font = '16px system-ui'
      const text = '哈'
      const result = context.measureText(text)
      const textWidth = result.width
      console.log('result', result)
      console.log('textWidth', textWidth)
    },
    clearText () {
      this.setData({
        content: '',
        value: '',
      })
    },
    textWidth(text:string): number {
      const canvas = wx.createOffscreenCanvas({
        type: '2d'
      })
      const context = canvas.getContext('2d')
      context.font = '16px system-ui'
      const result = context.measureText(text)
      return result.width
    }
  }
})
