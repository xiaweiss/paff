/**
 * 生成从 minNum 到 maxNum 的随机数
 */
export const randomNum = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1) + min)
}
