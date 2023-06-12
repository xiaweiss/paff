/**
 * 限制值的范围
 * @param {number} value 当前值
 * @param {number} min 最小值
 * @param {number} max 最大值
 * @returns { number } 返回值
 */
export function minMax(value = 0, min = 0, max = 0): number {
  return Math.min(Math.max(value, min), max)
}
