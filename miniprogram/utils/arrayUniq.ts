/**
 * 简单数组去重
 */
export const arrayUniq = <T = string>(array: T[]) => {
  const result = []
  const temp : {[key: string]: boolean } = {}

  for (const item of array) {
    if (!temp[String(item)]) {
      temp[String(item)] = true
      result.push(item)
    }
  }

  return result
}
