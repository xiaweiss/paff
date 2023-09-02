const app = getApp<AppData>()

Component({
  options: {
    virtualHost: true,
  },
  data: {
    cursorX: 0,
    cursorY: 0,
    isCustomNavigation: false,
    textareaValue: '',
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
      const {x, y} = e.detail
      const { navBarHeight } = app.globalData

      this.setData({
        cursorX: x,
        cursorY: y - navBarHeight,
        focus: true,
      })
    },
    onInput (e: WechatMiniprogram.Input) {
      const {value, cursor, keyCode} = e.detail
      console.log('onInput', value, cursor, keyCode)
      this.setData({
        content: value,
      })
    },
    onCompositionStart (e: any) {
      console.log('onCompositionStart', e)
    },
    onCompositionUpdate (e: any) {
      console.log('onCompositionUpdate', e)
    },
    onCompositionEnd (e: any) {
      console.log('onCompositionEnd', e)
    }
  }
})
