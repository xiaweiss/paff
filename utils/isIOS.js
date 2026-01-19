/**
 * 是否在 iOS 上（包含 iPhone、iPad）
 */
export const isIOS = (app = getApp()) => {
  return (
    app.globalData.systemInfo?.platform === 'ios'
    || app.globalData.systemInfo?.platform === 'devtools'
  )
}
