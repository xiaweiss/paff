/**
 * 是否在 Android 上
 */
export const isAndroid = (app = getApp()) => {
  return (
    app.globalData.systemInfo?.platform === 'android'
  )
}
