export const touchstart = (e) => {
  const touch  = e.touches[0]
  console.log('touchstart', touch)
}

export const touchmove = (e) => {
  console.log('touchmove', e)

}

export const touchend = (e) => {
  console.log('touchend', e)
}
