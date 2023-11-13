interface AppData {
  /** 全局保存的信息（只存一层） */
  globalData: {
    /** 当前键盘高度 */
    keyboardHeight: number
    /** 导航栏高度 */
    navBarHeight: number
    /** 底部安全区距离 */
    safeAreaBottom: number
    /** 系统信息 */
    systemInfo?: WechatMiniprogram.SystemInfo
    /** 包含自定义导航栏的窗口高度 */
    windowHeight: number
  }
}
