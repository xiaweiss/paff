interface ErrnoMessage {
  [key: string]: string
}
/**
 * 错误码对应的错误信息
 * @see https://developers.weixin.qq.com/miniprogram/dev/framework/usability/PublicErrno.html
 */
const errnoMessage: ErrnoMessage = {
  3: '系统权限未授予微信',
  4: '小程序框架内部异常',
  5: '当前网络不稳定，请稍后再试', // 网络超时
  100001: 'json 解析错误',
  600000:	'未知的网络错误',
  600001:	'网络错误',
  600003:	'网络中断',
  600007:	'超过最大请求数量',
  600008:	'超过最大重定向次数',
  600009:	'格式不合法',
  600010:	'请求的 data 序列化失败',
  600011:	'URL 验证错误',
  602301: '申请移动网络请求失败',
  602302:	'请求数据转换格式失败',
  603101:	'不支持 iOS 平台',
  603102:	'不支持安卓平台',
  603105:	'下载任务中断',
  603300:	'保存文件出错',
  603301:	'超出文件最大大小限制',
  603302:	'文件数据为空',
  603303:	'指定存储路径无权限',
  701001:	'不支持 iOS 平台',
  1107004: '截图失败',
  1107005: '截图后保存到相册失败',
  1107006: '截图后保存到临时文件失败',
  1107009: '进入后台音频播放模式时 src 为空',
  1107012: '资源文件加载失败',
  1402101: '小程序登录被拒绝', // 小程序登录被封禁
  1300002: '找不到文件或目录',
}

/**
 * 小程序错误码提示
 */
export const wxErrTip = (err: Partial<WechatMiniprogram.Err>) => {
  console.log('wxErrTip', err)
  let message

  if (err.errno && errnoMessage[err.errno]) {
    message = errnoMessage[err.errno]
  } else if (err.errMsg) {
    message = err.errMsg
  }

  if (message) {
    // 获取图片信息失败不提示
    if (message.match('getImageInfo:fail')) return

    // 选择图片失败不提示
    else if (message.match('chooseImage:fail')) return

    // 已取消不提示
    else if (message.match('fail cancel')) return

    // checkSession 不提示
    else if (message.match('checkSession:')) return

    else if (message.match(`previewImage:fail can't be invoked in 3000ms until user taps`))
      message = '预览图片失败，请稍后再试'

    wx.showToast({
      icon: message.length <= 7 ? 'error' : 'none',
      title: message,
    })
  }
}
