const app = getApp<AppData>()

Component({
  options: {
    pureDataPattern: /^_/,
    virtualHost: true,
  },
  data: {
    width: 0,
    canvas: wx.createOffscreenCanvas({type: '2d'}),
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
      // 获取窗口尺寸信息
      const windowInfo = wx.getWindowInfo()
      this.setData({
        width: windowInfo.windowWidth,
      })
    }
  },
  methods: {
    noop () {},
    /** 点击 */
    onTap (e: WechatMiniprogram.TouchEvent) {
      console.log('onTap', e)

      const { x } = e.detail

      const { content, composition } = this.data

      let cursorX = 0

      // 从头循环本行，来计算光标 X 位置
      for (const item of (content + composition)) {
        const textWidth = this.textWidth(item)
        if (x < cursorX + textWidth / 2) {
          break
        }
        cursorX += textWidth
      }

      this.setData({
        cursorX
      })

      if (!this.data.focus) {
        this.setData({focus: true})
      }
    },

    /**
     * 聚焦
     */
    onFocus (e: WechatMiniprogram.TextareaFocus) {
      this.data.focus = true
    },

    /**
     * 失焦
     */
    onBlur (e: WechatMiniprogram.TextareaBlur) {
      this.data.focus = false
    },

    /**
     * 行数变化
     */
    onLineChange (e: WechatMiniprogram.TextareaLineChange) {

    },
    /**
     * 输入
     */
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
    /**
     * 键盘高度变化
     */
    onKeyboardHeightChange (e: WechatMiniprogram.InputKeyboardHeightChange) {

    },

    /**
     * 输入过程开始
     */
    onKeyboardCompositionStart (e: any) {
      const { data } = e.detail
      const { content } = this.data

      this.setData({
        composition: data.slice(1),
        cursorX: this.textWidth(content + data.slice(1))
      })
    },

    /**
     * 输入过程更新
     */
    onKeyboardCompositionUpdate (e: any) {
      const { data } = e.detail
      const { content } = this.data

      this.setData({
        composition: data.slice(1),
        cursorX: this.textWidth(content + data.slice(1))
      })
    },

    /**
     * 输入过程结束
     */
    onKeyboardCompositionEnd (e: any) {
      const { data } = e.detail
      const { content } = this.data

      this.setData({
        composition: data.slice(1),
        cursorX: this.textWidth(content + data.slice(1))
      })
    },

    /**
     * 清空文字
     */
    clearText () {
      this.setData({
        content: '',
        value: '',
      })
    },

    /**
     * 测量文字宽度
     */
    textWidth(text:string): number {
      const { canvas } = this.data
      const context = canvas.getContext('2d')
      context.font = '16px Menlo,system-ui'
      const result = context.measureText(text)
      return result.width
    },

    fillText() {
      let { content } = this.data
      content += '哈哈哈'
      this.setData({
        content,
        composition: '',
        cursorX: this.textWidth(content)
      })
    }
  }
})
