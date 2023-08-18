const app = getApp<AppData>()

Component({
  options: {
    virtualHost: true,
  },
  data: {
    cursorX: 0,
    cursorY: 0,
    isCustomNavigation: false,
  },
  lifetimes: {
    attached () {

    }
  },
  methods: {
    onTap (e: WechatMiniprogram.TouchEvent) {
      const {x, y} = e.detail
      const { navBarHeight } = app.globalData

      this.setData({
        cursorX: x,
        cursorY: y - navBarHeight,
      })
    }
  }
})
