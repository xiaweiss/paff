/**
 * 是否在微信开发者工具内
 */
export const isDevtools = (app = getApp()) => {
  return app.globalData.systemInfo?.platform === 'devtools'
}
