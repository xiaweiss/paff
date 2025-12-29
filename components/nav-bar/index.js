Component({
  options: {
    multipleSlots: true
  },
  properties: {
    /** 标题 */
    title: { type: String, value: '' },
    /** 背景颜色 */
    background: { type: String, value: 'transparent' },
    /** 背景颜色（桌面端） */
    backgroundPC: { type: String, value: '#fff' },
    /** 前景颜色值，包括按钮、标题、状态栏的颜色，仅支持 #ffffff 和 #000000 */
    frontColor: { type: String, value: '#000000' },
    /** 样式 */
    style: { type: String, value: '' },
    /** 自定义内容 */
    custom: { type: Boolean, value: false },
  },
  data: {
    vip: '',
    /** 胶囊高度 */
    capsuleHeight: 26,
    /** 胶囊宽度 */
    capsuleWidth: 83,
    /** 是否 skyline */
    isSkyline: false,
    /** 是否桌面端 */
    isPC: false,
    /** 是否显示后退按钮 */
    isBack: false,
    /** 是否首页 */
    isHome: false,
    /** 导航栏高度 */
    navbarHeight: 44,
    /** 导航栏上边距 */
    navbarPaddingTop: 0,
    /** 导航栏右侧小程序胶囊按钮宽度 */
    navbarPaddingRight: 95,
  },
  lifetimes: {
    attached () {
      const { platform } = wx.getDeviceInfo()
      this.setData({
        isPC: platform === 'mac' || platform === 'windows',
        isIOS: platform === 'ios'
      })

      const { title } = this.properties
      const { isPC } = this.data
      /**
       * @bug: [ios] wx.setNavigationBarTitle 在朋友圈单页模式下无效
       * @see: https://github.com/xiaweiss/miniprogram-bug-report/issues/310
       * @hack: 配置页面 json 的 navigationBarTitleText
       */
      if (isPC) wx.setNavigationBarTitle({title})

      this.calcStyle()
      const pages = getCurrentPages()
      const page = pages[pages.length - 1]
      const isHome = [
        'pages/index/index',
      ].includes(page.route)

      this.setData({
        isBack: pages.length > 1,
        isHome,
      })
    },
  },
  observers: {
    'frontColor, backgroundPC' (frontColor, backgroundPC) {
      // backgroundColor 仅 PC 端生效
      wx.setNavigationBarColor({frontColor, backgroundColor: backgroundPC})
    },
    'title' (title) {
      const { isPC } = this.data
      if (isPC) wx.setNavigationBarTitle({title})
    }
  },
  methods: {
    /**
     * 计算样式
     */
    calcStyle () {
      const { isIOS } = this.data
      // 场景值为1177（视频号直播间）和1175 （视频号profile页）时，小程序禁用了 wx.getMenuButtonBoundingClientRect
      let rect = null
      if (wx.getMenuButtonBoundingClientRect) {
        rect = wx.getMenuButtonBoundingClientRect()
      }
      if (rect) {
        const {left, top, bottom, width: capsuleWidth, height: capsuleHeight} = rect

        const { windowWidth }  = wx.getWindowInfo()
        const navbarHeight = isIOS ? 44 : 48;

        const navbarPaddingTop = (bottom + top) / 2 - navbarHeight / 2
        const navbarPaddingRight = windowWidth - left

        this.setData({
          capsuleHeight,
          capsuleWidth,
          navbarHeight,
          navbarPaddingRight,
          navbarPaddingTop,
        })
      }
    },
    /**
     * 页面后退
     */
    back () {
      wx.navigateBack()
    },
    /**
     * 回到首页
     */
    home () {
      wx.reLaunch({url: '/pages/index/index'})
    }
  },
})
