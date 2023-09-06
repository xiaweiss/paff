/**
 * 是否微信开发者工具
 */
export const isWechatDevTools = (app = getApp<AppData>()) => {
  return app.globalData.systemInfo?.platform === 'devtools'
}
