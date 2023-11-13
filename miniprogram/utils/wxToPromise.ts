type Result<T = WechatMiniprogram.GeneralCallbackResult> = Promise<[T?, WechatMiniprogram.GeneralCallbackResult?]>

/**
 * 微信 api 转为 promise
 */
function wxToPromise<T extends (...args: any) => any, P = NonNullable<Parameters<T>[0]>, R = NonNullable<Parameters<NonNullable<Parameters<T>[0]>['success']>>[0]> (api: any, option?: P): Result<R> {
  // API 存在判断
  if (!api) {
    wx.showModal({
      title: '提示',
      content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
    })
    return Promise.reject()
  }

  return new Promise((resolve) => {
    api({
      ...option,
      success (res: R) {
        resolve([res, undefined])
      },
      fail (err: WechatMiniprogram.GeneralCallbackResult) {
        resolve([undefined, err])
      },
    })
  })
}

export { wxToPromise }
