import { getEditor } from './getEditor'

export const clearContent = () => {
  getEditor().setData({
    node: {doc: []}
  })
}
