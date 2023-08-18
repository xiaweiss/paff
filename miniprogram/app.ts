
import { wxToPromise, isPC, emitter, isIOS, isCustomNavigation } from './utils/index'
import { showModal } from './components/modal/showModal'

interface AppOption extends AppData {
  getSyetemInfo: () => void
  registerCommand: () => void
  setSetting: () => void
  update: () => void
}

/** 全局数据初始值 */
const globalData : AppData['globalData'] = {
  keyboardHeight: 0,
  navBarHeight: 0,
  safeAreaBottom: 0,
  systemInfo: undefined,
  windowHeight: 0,
}

/**
 * @see https://developers.weixin.qq.com/miniprogram/dev/reference/api/App.html
 */
App<AppOption>({
  globalData,
  async onLaunch(option) {
    this.registerCommand()

    /**
     * 限制频率的接口，必须在这里调用
     * @see https://developers.weixin.qq.com/miniprogram/dev/framework/performance/api-frequency.html
     */
    this.getSyetemInfo()

    this.setSetting()

    this.update()
  },
  async onShow(option) {

    // 小程序保持常亮状态
    if (!isPC(this)) {
      await wxToPromise(wx.setKeepScreenOn, {keepScreenOn: true})
    }
  },
  /**
   * 小程序版本更新
   */
  update () {
    const updateManager = wx.getUpdateManager()
    updateManager.onCheckForUpdate((res) => {
      // 请求完新版本信息的回调
      if (res.hasUpdate) {
        updateManager.onUpdateReady(() => {
          wx.showModal({
            title: '更新提示',
            content: '新版本已经准备好，是否重启应用？',
            cancelColor: '#B2B2B2',
            confirmColor: '#CC5656',
            success: async  (res) => {
              if (res.confirm) {
                const pages = getCurrentPages()
                if (pages.length > 1) {
                  await wxToPromise(wx.navigateBack, {delta: pages.length - 1})
                }
                // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
                setTimeout(() => {
                  updateManager.applyUpdate()
                }, 400)
              }
            }
          })
        })
      }
    })
  },
  /**
   * 注册全局的便利函数
   */
  registerCommand () {
    this.showModal = showModal.bind(this)
  },
  showModal () {},
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
        const {top, bottom} = rect!
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
   * 设置小程序配置
   */
  async setSetting () {
    // 转发设置，重置分享参数
    wx.updateShareMenu({
      withShareTicket: false,
      isPrivateMessage: false
    })

    // 键盘高度变化事件
    wx.onKeyboardHeightChange((res) => {
      this.globalData.keyboardHeight = res.height
      emitter.emit('keyboardHeightChange', res)
    })

    // 窗口尺寸变化事件（微信 bug： mac 客户端 <= 3.7.0 版本不能触发）
    wx.onWindowResize((res) => {
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
    })
  }
})
