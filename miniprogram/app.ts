
// @ts-ignore
import CustomHook from 'spa-custom-hooks'
import { wxToPromise, isPC, emitter, isMac, isIOS, compareVersion } from './utils/index'
import { showModal } from './components/modal/showModal'

interface AppOption extends AppData {
  getSyetemInfo: () => void
  registerCommand: () => void
  setLaunchShowOption: (option: WechatMiniprogram.App.LaunchShowOption, type: string) => void
  setSetting: () => void
  update: () => void
}

/** 全局数据初始值 */
const globalData : AppData['globalData'] = {
  keyboardHeight: 0,
  navBarHeight: 0,
  safeAreaBottom: 0,
  systemInfo: undefined,
}

/**
 * @see https://developers.weixin.qq.com/miniprogram/dev/reference/api/App.html
 */
App<AppOption>({
  globalData,
  async onLaunch(option) {
    this.registerCommand()
    this.setLaunchShowOption(option, 'AppLaunch')

    /**
     * 限制频率的接口，必须在这里调用
     * @see https://developers.weixin.qq.com/miniprogram/dev/framework/performance/api-frequency.html
     */
    this.getSyetemInfo()

    this.setSetting()

    this.update()
  },
  async onShow(option) {
    this.setLaunchShowOption(option, 'AppShow')

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

    // mac <= 2.7.0 修正 Mac 窗口高度，减去导航栏高度
    if (isMac(this) && compareVersion(systemInfo.version, '2.7.0') <= 0 && systemInfo.windowHeight === systemInfo.screenHeight) {
      this.globalData.systemInfo.windowHeight -= 44
    }

    // mac <= 2.7.0 不能响应 resize 事件，所以这里先按始终展示滚动条时，最小尺寸设置
    if (isMac(this) && compareVersion(systemInfo.version, '2.7.0') <= 0) {
      this.globalData.systemInfo.windowWidth = 1009
      this.globalData.systemInfo.screenWidth = 1009
    }

    // 计算底部安全区高度，mac screenHeight 比实际显示的高，这里做个修正
    // windows 2.26.1 开始 screenHeight 和 windowHeight 不同了，需要用 systemInfo.windowHeight - systemInfo.safeArea.bottom
    this.globalData.safeAreaBottom = isPC(this) ? 0 : systemInfo.screenHeight - systemInfo.safeArea.bottom

    // 计算导航栏高度
    if (wx.getMenuButtonBoundingClientRect) {
      const rect = wx.getMenuButtonBoundingClientRect()
      if (rect) {
        const {top, bottom} = rect!
        const navbarHeight = isIOS(this) ? 44 : 48;
        const navbarPaddingTop = (bottom + top) / 2 - navbarHeight / 2
        this.globalData.navBarHeight = navbarHeight + navbarPaddingTop
      }
    }

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

      // todo: 看下屏幕旋转时，windowHeight 是否需要包含导航栏高度

      /**
       * 窗口尺寸没有变化，页面跳转、返回时 wx.onWindowResize 也会多触发
       * @see https://github.com/xiaweiss/miniprogram-bug-report/issues/28
       * @hack 数据相同时，不触发事件
       */
      if (
        this.globalData.systemInfo.screenHeight === res.size.screenHeight &&
        this.globalData.systemInfo.screenWidth === res.size.screenWidth &&
        this.globalData.systemInfo.windowHeight === res.size.windowHeight &&
        this.globalData.systemInfo.windowWidth === res.size.windowWidth
      ) return

      this.globalData.systemInfo.screenHeight = res.size.screenHeight
      this.globalData.systemInfo.screenWidth = res.size.screenWidth
      this.globalData.systemInfo.windowHeight = res.size.windowHeight
      this.globalData.systemInfo.windowWidth = res.size.windowWidth

      // 事件触发器，去广播给页面
      emitter.emit('windowResize')
    })
  },
  /**
   * 设置启动参数
   */
  setLaunchShowOption (option, type) {
    console.log(type, 'option', option)
  }
})
