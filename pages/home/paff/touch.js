let scrollStart = 0
let scrollHeight = 0
let height = 0
let startX = 0
let startY = 0
let type = ''

export const touchstart = ({e, scrollTop, scrollHeight: _scrollHeight, height: _height}) => {
  const touch  = e.touches[0]
  const { clientX, clientY } = touch

  scrollStart = scrollTop
  scrollHeight = _scrollHeight
  height = _height
  startX = clientX
  startY = clientY
}

export const touchmove = ({e}) => {
  const { clientX, clientY } = e.touches[0]


  const dy = Math.round(startY - clientY)
  let scrollTop = scrollStart + dy

  // if (ry > 0) ry = 0
  // if (ry < -(scrollHeight - height)) ry = -(scrollHeight - height)


  type = 'scroll'

  return { type, scrollTop }
}

export const touchend = ({e, scrollTop: _scrollTop, scrollHeight, height}) => {
  let scrollTop

  // 内容不够一屏幕时
  if (scrollHeight <= height) {
    scrollTop = 0

  // 下拉超出边界时
  } else if (_scrollTop < 0) {
    scrollTop = 0

  // 上拉超出边界时
  } else if (_scrollTop > scrollHeight - height) {
    scrollTop = scrollHeight - height

  } else {
    scrollTop = _scrollTop
  }

  type = ''

  return { scrollTop }
}
