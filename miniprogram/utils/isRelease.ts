/**
 * 是否正式版小程序
 */
export const isRelease = () => {
  return __wxConfig.envVersion === 'release'
}
