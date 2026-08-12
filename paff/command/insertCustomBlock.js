import { emitter } from '../../utils/emitter'

export const insertCustomBlock = (data) => ({editor}) => {
  editor.insertCustomBlock({
    success: (res) => {
      emitter.emit('insertCustomBlock', {blockId: res.blockId, ...data})
    }
  })
}
