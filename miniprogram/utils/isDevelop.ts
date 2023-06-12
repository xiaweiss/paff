/**
 * 是否体开发版小程序
 */
export const isDevelop = () => {
  return __wxConfig.envVersion === 'develop'
}
