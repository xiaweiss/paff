let scrollTop = 0
let scrollHeight = 0
let height = 0
let startX = 0
let startY = 0
let type = ''

export const touchstart = ({e, scrollTop: _scrollTop, scrollHeight: _scrollHeight, height: _height}) => {
  const touch  = e.touches[0]
  const { clientX, clientY } = touch

  scrollTop = _scrollTop
  scrollHeight = _scrollHeight
  height = _height
  startX = clientX
  startY = clientY
}

export const touchmove = ({e}) => {
  const { clientX, clientY } = e.touches[0]

  // const rx = 0
  // const dy = Math.round(clientY - startY)
  // // 0 < ry < scrollHeight - windowHeight
  // const ry = Math.min(-scrollTop + dy, 0)

  let rx = 0
  const dy = Math.round(clientY - startY)
  let ry = -scrollTop + dy

  if (ry > 0) ry = 0
  if (ry < -(scrollHeight - height)) ry = -(scrollHeight - height)

  console.log('ry', ry) // -314
  console.log('scrollHeight', scrollHeight)
  console.log('height', height)




  type = 'scroll'

  return { type, rx, ry }
}

export const touchend = ({e}) => {
  console.log('touchend', e)

  type = ''
}
