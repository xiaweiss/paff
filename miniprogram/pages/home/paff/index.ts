import { isPC } from '../../../utils/index'

const app = getApp<AppData>()

Component({
  options: {
    virtualHost: true,
  },
  data: {
    isPC: isPC(),
    cursorX: 0,
    cursorY: 0,
    isCustomNavigation: false,
    inputValue: isPC() ? ' ' : '',
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
    onInput (e: WechatMiniprogram.Input) {
      const { cursor, keyCode } = e.detail
      const { isPC } = this.data
      let { value } = e.detail
      let { content } = this.data

      /**
       * @bug: [mac] input 框无内容时，按 Backspace 键时，无法触发 input 事件
       * @see: https://github.com/xiaweiss/miniprogram-bug-report/issues/164
       * @hack: hack: 如果不需要 placeholder 时，输入框里始终保留一个空格
       */
      if (isPC) {
        value = value.slice(1)
      }

      console.log('onInput', value, cursor, keyCode)
      console.log('onInput value', `[${value}]`)

      /**
       * keyCode
       * @see https://developer.mozilla.org/zh-CN/docs/Web/API/KeyboardEvent/keyCode
       */
      switch (keyCode) {
        // Backspace
        case 8: {
          content = content.slice(0, -1)
          break
        }
        // Tab
        case 9: {

        }
        // ios 换行
        case 10: {

        }
        // Enter
        case 13: {
        }
        // Space
        case 32: {
        }
        // Delete
        case 64: {

        }
        default: {
          content += value
        }
      }

      console.log('content', `[${content}]`)

      let width = this.textWidth(content)
      console.log("width: ", width);

      this.setData({
        content,
        cursorX: width
      })

      // PC
      if (isPC) {
        return ' '

      // mobile
      } else {
        this.setData({
          inputValue: '',
        })
        return ''
      }

    },
    onKeyboardHeightChange (e: WechatMiniprogram.InputKeyboardHeightChange) {
      console.log('onKeyboardHeightChange', e)
    },
    onCompositionStart (e: any) {
      console.log('onCompositionStart', e)
    },
    onCompositionUpdate (e: any) {
      console.log('onCompositionUpdate', e)
    },
    onCompositionEnd (e: any) {
      console.log('onCompositionEnd', e)
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
        inputValue: '',
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
