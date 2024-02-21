let startX = 0
let startY = 0
let type = ''

export const touchstart = (e) => {
  const touch  = e.touches[0]
  const { clientX, clientY } = touch

  startX = clientX
  startY = clientY
  // console.log('touchstart', startX, startY)
}

export const touchmove = (e) => {
  const { clientX, clientY } = e.touches[0]

  const dx = 0
  const dy = clientY - startY

  type = 'scroll'
  // console.log('touchmove', dy)

  return { type, dx, dy }
}

export const touchend = (e) => {
  console.log('touchend', e)

  type = ''
}
