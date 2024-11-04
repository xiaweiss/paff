const app = getApp()

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
    measureText: '',
    _measureTextNode: null,
  },
  lifetimes: {
    attached () {
      // 获取窗口尺寸信息
      const windowInfo = wx.getWindowInfo()
      this.setData({
        width: windowInfo.windowWidth,
      })
    },
    ready() {
      const query = this.createSelectorQuery()
      this.data._measureTextNode = query.select('#measure-text')
    },
  },
  methods: {
    noop () {},
    /** 点击 */
    async onTap (e) {
      console.log('onTap', e)

      const { x } = e.detail

      const { content, composition } = this.data

      let cursorX = 0
      let line = ''

      // 从头逐个字渲染本行，来计算光标 X 位置
      // TODO: 需要优化下算法，来减少循环的次数
      for (const item of (content + composition)) {
        line += item
        const left = cursorX
        const right = await this.textWidth(line)
        if (x < left + (right - left) / 2) {
          cursorX = left
          break
        }
        cursorX = right
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
    onFocus (e) {
      this.data.focus = true
    },

    /**
     * 失焦
     */
    onBlur (e) {
      this.data.focus = false
    },

    /**
     * 行数变化
     */
    onLineChange (e) {

    },
    /**
     * 输入
     */
    onInput (e) {
      const { value } = e.detail
      let { content } = this.data

      console.log('onInput', value)

      // Backspace
      if (value.length === 0) {
        content = content.slice(0, -1)
      } else {
        content += value.slice(1)
      }

      this.textWidth(content).then((width) => {
        this.setData({
          content,
          composition: '',
          cursorX: width
        })
      })

      return ' '
    },

    /**
     * 键盘高度变化
     */
    onKeyboardHeightChange (e) {

    },

    /**
     * 输入过程开始
     */
    async onKeyboardCompositionStart (e) {
      const { data } = e.detail
      const { content } = this.data

      this.setData({
        composition: data.slice(1),
        cursorX: await this.textWidth(content + data.slice(1))
      })
    },

    /**
     * 输入过程更新
     */
    async onKeyboardCompositionUpdate (e) {
      const { data } = e.detail
      const { content } = this.data

      this.setData({
        composition: data.slice(1),
        cursorX: await this.textWidth(content + data.slice(1))
      })
    },

    /**
     * 输入过程结束
     */
    async onKeyboardCompositionEnd (e) {
      const { data } = e.detail
      const { content } = this.data

      this.setData({
        composition: data.slice(1),
        cursorX: await this.textWidth(content + data.slice(1))
      })
    },

    /**
     * 清空文字
     */
    clearText () {
      this.setData({
        content: '',
        value: '',
        cursorX: 0,
      })
    },

    /**
     * 测量文字宽度
     */
    async textWidth (text) {
      this.setData({
        measureText: text || ''
      })

      const width = await new Promise((resolve) => {
        this.data._measureTextNode.boundingClientRect((rect) => {
          resolve(rect.width)
        }).exec()
      })

      return Promise.resolve(width)
    },

    async showTextWidth () {
      const { content, composition } = this.data
      const width = await this.textWidth(content + composition)
      wx.showToast({
        title: `width：${width}`,
        icon: 'none'
      })
    },

    async fillText() {
      let { content } = this.data
      content += '哈哈哈'
      this.setData({
        content,
        composition: '',
        cursorX: await this.textWidth(content)
      })
    },

    log () {

    }
  }
})
