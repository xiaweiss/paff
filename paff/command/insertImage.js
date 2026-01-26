import { updateData, wxToPromise } from '../../utils/index'


export const insertImage = () => async ({editor, paff}) => {
  console.log('Insert Image Command Triggered')

  // const [res] = await wxToPromise(wx.chooseImage, {
  //   count: 1,
  //   sizeType: ['original'],
  //   sourceType: ['album'],
  // })

  // if (!res) return
  // const url = res.tempFilePaths[0]
  // const [{width, height}] = await wxToPromise(wx.getImageInfo, {src: url})

  const blockId = await new Promise((resolve) => {
    editor.insertCustomBlock({
      nowrap: false,
      success (res) {
        resolve(res.blockId)
      }
    })
  })

  console.log('blockId', blockId)

  updateData(paff, ['customBlockList', paff.data.customBlockList.length], {
    blockId,
    type: 'image',
    attrs: {
      url: '111',
      width: 100,
      height: 100,
    }
  })

  console.log('customBlockList', paff.data.customBlockList)
}
