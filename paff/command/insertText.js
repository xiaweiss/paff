import { getEditor } from './getEditor'
import { paragraphLine } from '../utils/paragraphLine'
import { getWindowWidth } from './getWindowWidth'
import { getPadding } from './getPadding'

export const insertText = async (text) => {
  const dataDoc = {
    type: 'doc',
    content: [
      {
        type: 'paragraph',
        content: [
          {
            type: 'text',
            text
          }
        ]
      }
    ]
  }

  const editor = getEditor()
  const windowWidth = getWindowWidth()
  const padding = getPadding()
  const node = await paragraphLine(dataDoc, windowWidth - padding[1] - padding[3], editor)

  // todo: 此处可以 diff，按需 setData 来提高性能
  editor.setData({node})
}
