import { isPC } from './isPC'
import { isWxwork } from './isWxwork'
import { isMac } from './isMac'

/**
 * 判断是否是自定义导航栏
 */
export const isCustomNavigation = (systemInfo, app = getApp()) => {
  // 移动端、mac 版企业微信，才需要自定义导航栏
  if (!isPC(app) || (isWxwork(app) && isMac(app))) {
    const { windowHeight, screenHeight } = systemInfo
    return windowHeight === screenHeight && typeof wx.getMenuButtonBoundingClientRect === 'function'
  } else {
    return false
  }
}
