/**
 * 是否体验版版小程序
 */
export const isTrial = () => {
  return __wxConfig.envVersion === 'trial'
}
