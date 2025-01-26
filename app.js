
import { wxToPromise, isPC, emitter, isIOS, isCustomNavigation } from './utils/index'


/** 全局数据初始值 */
const globalData = {
  keyboardHeight: 0,
  navBarHeight: 0,
  safeAreaBottom: 0,
  systemInfo: undefined,
  windowHeight: 0,
}

/**
 * @see https://developers.weixin.qq.com/miniprogram/dev/reference/api/App.html
 */
App({
  globalData,
  async onLaunch() {
    /**
     * 限制频率的接口，必须在这里调用
     * @see https://developers.weixin.qq.com/miniprogram/dev/framework/performance/api-frequency.html
     */
    this.getSyetemInfo()

    try { await this.getSetting() } catch {}

    this.setSetting()
  },
  async onShow() {
    // 小程序保持常亮状态
    if (!isPC(this)) {
      await wxToPromise(wx.setKeepScreenOn, {keepScreenOn: true})
    }
  },
  /**
   * 获取系统信息
   */
  getSyetemInfo () {
    const systemInfo = wx.getSystemInfoSync()
    this.globalData.systemInfo = systemInfo

    // 计算底部安全区高度
    this.globalData.safeAreaBottom = isPC(this) ? 0 : (systemInfo.screenHeight - systemInfo.safeArea.bottom)

    // 计算导航栏高度（非自定义导航的页面需要通过 isCustomNavigation 自行处理）
    if (!isPC(this) && wx.getMenuButtonBoundingClientRect) {
      const rect = wx.getMenuButtonBoundingClientRect()
      if (rect) {
        const {top, bottom} = rect
        const navbarHeight = isIOS(this) ? 44 : 48;
        const navbarPaddingTop = (bottom + top) / 2 - navbarHeight / 2
        this.globalData.navBarHeight = navbarHeight + navbarPaddingTop
      }
    }

    // 包含自定义导航栏的窗口高度
    const { navBarHeight } = this.globalData
    const { windowHeight } = systemInfo
    this.globalData.windowHeight = isCustomNavigation(systemInfo, this) ? windowHeight : (windowHeight + navBarHeight)

    console.log('systemInfo', this.globalData.systemInfo)
  },
  /**
   * 获取设置信息
   */
  async getSetting () {
    // 检查权限状态
    const [res] = await wxToPromise(wx.getSetting)
    if (res) {
      this.globalData.authRecord = res.authSetting['scope.record']
      this.globalData.authWritePhotosAlbum = res.authSetting['scope.writePhotosAlbum']
    }
  },
  /**
   * 设置小程序配置
   */
  async setSetting () {
    // 键盘高度变化事件
    wx.onKeyboardHeightChange((res) => {
      this.globalData.keyboardHeight = res.height
      emitter.emit('keyboardHeightChange', res)
    })

    let timer = 0

    // 窗口尺寸变化事件（微信 bug： mac 客户端 <= 3.7.0 版本不能触发）
    wx.onWindowResize((res) => {
      // 防抖函数
      clearTimeout(timer)
      timer = setTimeout(() => {
        if (!res.size || !this.globalData.systemInfo) return

        const { windowHeight, windowWidth } = res.size
        const { navBarHeight } = this.globalData

        /**
         * 窗口尺寸没有变化，页面跳转、返回时 wx.onWindowResize 也会多触发
         * @see https://github.com/xiaweiss/miniprogram-bug-report/issues/28
         * @hack 数据相同时，不触发事件
         */
        if (
          this.globalData.systemInfo.windowHeight === windowHeight &&
          this.globalData.systemInfo.windowWidth === windowWidth
        ) return

        this.globalData.systemInfo.windowHeight = windowHeight
        this.globalData.systemInfo.windowWidth = windowWidth

        const { systemInfo } = this.globalData
        // 包含自定义导航栏的窗口高度
        this.globalData.windowHeight = isCustomNavigation(systemInfo, this) ?  windowHeight : (windowHeight + navBarHeight)

        // 事件触发器，去广播给页面
        emitter.emit('windowResize')
      }, 16)
    })

    // PC 键盘按下事件（只触发当前一个页面）
    if (isPC(this) && wx.onKeyDown) {
      wx.onKeyDown(res => {
        const page = getPage().selectComponent('#page')
        if (page?.onKeyDown) page.onKeyDown(res)
      })
    }

    // 字体大小变化
    emitter.on('fontSize:change', ({fontSize}) => {
      wx.setStorageSync<Storage.fontSize>('fontSize', {fontSize, time: Date.now()})
      this.globalData.fontSize = fontSize
    })

    // 主题色变化
    emitter.on('theme:change', ({theme}) => {
      wx.setStorageSync<Storage.theme>('theme', {theme, time: Date.now()})
      this.globalData.theme = theme
    })
  }
})
