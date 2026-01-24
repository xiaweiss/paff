export const save = () => ({editor}) => {
  console.log('save')
  editor.blur()
  editor.getContents({
    success: (res) => {
      console.log('getContents success', res)
    },
    fail: (err) => {
      console.error('getContents fail', err)
    }
  })
}
