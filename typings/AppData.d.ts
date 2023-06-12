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
    /** 用户 ID */
  }
  showModal: ShowModal
}

interface ShowModalOption {
  /** 取消按钮的文字颜色，必须是 16 进制格式的颜色字符串 */
  cancelColor?: string
  /** 取消按钮的文字，最多 4 个字符 */
  cancelText?: string
  /** 接口调用结束的回调函数（调用成功、失败都会执行） */
  complete?: null | WechatMiniprogram.ShowModalCompleteCallback
  /** 确认按钮的文字颜色，必须是 16 进制格式的颜色字符串 */
  confirmColor?: string
  /** 确认按钮的文字，最多 4 个字符 */
  confirmText?: string
  /** 提示的内容 */
  content?: string
  /** 需要基础库： `2.17.1`
   *
   * 是否显示输入框 */
  editable?: boolean
  /** 接口调用失败的回调函数 */
  fail?: null | WechatMiniprogram.ShowModalFailCallback
  /** 需要基础库： `2.17.1`
   *
   * 显示输入框时的提示文本 */
  placeholderText?: string
  /** 是否显示取消按钮 */
  showCancel?: boolean
  /** 接口调用成功的回调函数 */
  success?: null | WechatMiniprogram.ShowModalSuccessCallback
  /** 提示的标题 */
  title?: string

  /** 文本输入框最大长度 */
  maxLength?: number
  /** 点蒙层是否关闭（默认不关闭） */
  overlayClose?: boolean
  /** 内容的对齐方式 */
  contentAlign?: 'left' | 'center'
}

interface ShowModal {
  <T extends ShowModalOption = ShowModalOption>(data: T) : void
}
