const canvas = wx.createOffscreenCanvas({type: '2d', width: 50, height: 26})
const ctx = canvas.getContext('2d')
ctx.font = '16px MiSansLatin,Arial,system-ui'

export const measureTextWidth = (text) => {
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.fillText(text, 0, 19)
  return +ctx.measureText(text).width.toFixed(2)
}
