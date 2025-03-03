export const clearContent = (editor) => {
  editor.setData({
    node: {doc: []}
  })
}
