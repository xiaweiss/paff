import { getEditor } from './getEditor'
import { getPadding } from './getPadding'
import { getWindowWidth } from './getWindowWidth'
import { paragraphLine } from '../utils/paragraphLine'

export const setContent = async (dataDoc) => {
  const editor = getEditor()
  const windowWidth = getWindowWidth()
  const padding = getPadding()
  const node = await paragraphLine(dataDoc, windowWidth - padding[1] - padding[3], editor)
  editor.setData({ node })
}
