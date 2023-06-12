/**
 * 比较版本号
 * @see https://developers.weixin.qq.com/miniprogram/dev/framework/compatibility.html
 * @param version1
 * @param version2
 * @returns 1: version1 > version2, 0: version1 = version2, -1: version1 < version2
 */
export const compareVersion = (version1: string, version2: string) => {
  const v1 = version1.split('.')
  const v2 = version2.split('.')
  const len = Math.max(v1.length, v2.length)

  while (v1.length < len) {
    v1.push('0')
  }
  while (v2.length < len) {
    v2.push('0')
  }

  for (let i = 0; i < len; i++) {
    const num1 = parseInt(v1[i])
    const num2 = parseInt(v2[i])

    if (num1 > num2) {
      return 1
    } else if (num1 < num2) {
      return -1
    }
  }

  return 0
}

// console.log(compareVersion('1.11.0', '1.9.9')) // 1
// console.log(compareVersion('1.10.0', '1.11.0')) // -1
// console.log(compareVersion('3.6.22', '3.7')) // 1
// console.log(compareVersion('2.7', '2.7.0')) // 0
