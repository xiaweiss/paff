import { isPC } from './isPC'
import { isWxwork } from './isWxwork'
import { isMac } from './isMac'

/**
 * 判断是否是自定义导航栏
 */
export const isCustomNavigation = (systemInfo: WechatMiniprogram.SystemInfo, app = getApp<AppData>()) => {
  // 移动端、mac 版企业微信，才需要自定义导航栏
  if (!isPC(app) || (isWxwork(app) && isMac(app))) {
    const { windowHeight, screenHeight } = systemInfo
    console.log('isCustomNavigation', windowHeight === screenHeight && typeof wx.getMenuButtonBoundingClientRect === 'function', systemInfo)
    return windowHeight === screenHeight && typeof wx.getMenuButtonBoundingClientRect === 'function'
  } else {
    console.log('isCustomNavigation', false)
    return false
  }
}
