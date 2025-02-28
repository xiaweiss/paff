import { emitter, wxToPromise, sleep } from '../utils/index'

Component({
  options: {
    pureDataPattern: /^_/,
    virtualHost: true,
  },
  data: {
    editor: null,
    keyboardHeight: 0,

    editorHeight: 300,
    status: {},
    customBlockList: [],
    windowWidth: 0,
  },
  lifetimes: {
    attached () {
      const { navBarHeight, systemInfo } = getApp().globalData
      const { windowWidth, windowHeight } = systemInfo

      this.setData({
        windowWidth,
        editorHeight: windowHeight - navBarHeight - 50
      })

      this.onKeyboardHeightChange = this.onKeyboardHeightChange.bind(this)
      emitter.on('keyboardHeightChange', this.onKeyboardHeightChange)
    },
    detached () {
      emitter.off('keyboardHeightChange', this.onKeyboardHeightChange)
    }
  },
  methods: {
    async onKeyboardHeightChange (res) {
      if (res.height === this.data.keyboardHeight) return
      this.data.keyboardHeight = res.height

      const { navBarHeight, systemInfo } = getApp().globalData
      const { windowHeight } = systemInfo
      const { keyboardHeight, editor } = this.data
      const duration = res.height > 0 ? res.duration * 1000 : 0
      await sleep(duration)
      await wxToPromise(wx.pageScrollTo, {scrollTop: 0})

      let editorHeight = windowHeight - navBarHeight - 50
      if (keyboardHeight > 0) editorHeight -= keyboardHeight

      // updatePosition
      this.setData({editorHeight}, () => {
        editor.scrollIntoView()
      })
    },
    onEditorReady () {
      this.createSelectorQuery().select('#editor').context((res) => {
        this.data.editor = res.context
      }).exec()
    },
    onStatusChange (e) {
      console.log('onStatusChange', e.detail)
      this.setData({ status: e.detail })
    },
    onEditorInput (e) {
      console.log('onEditorInput', e.detail)
    },
    async command (e) {
      const { command, node } = e.detail
      const { editor, customBlockList } = this.data

      switch (command) {
        case 'del': {
          const res = await new Promise((resolve) => {
            editor.getContents({success: resolve})
          })
          const { delta } = res
          const index = delta.ops.findIndex(item => {
            return (item.insert?.customBlock?.id) === node.blockId
          })

          delta.ops.splice(index, 1)
          editor.setContents({delta})

          break
        }
        case 'save': {
          editor.blur()
          editor.getContents({
            success (res) {
              console.log('getContents', res)
            }
          })
          break
        }
        case 'bold': {
          editor.format('bold')
          break
        }
        case 'img': {
          console.log('img')
          const [res] = await wxToPromise(wx.chooseImage, {
            count: 1,
            sizeType: ['original'],
            sourceType: ['album'],
          })

          if (res) {
            const url = res.tempFilePaths[0]
            const [{width, height}] = await wxToPromise(wx.getImageInfo, {src: url})

            const blockId = await new Promise((resolve) => {
              editor.insertCustomBlock({
                success (res) {
                  resolve(res.blockId)
                }
              })
            })

            this.setData({
              [`customBlockList[${customBlockList.length}]`]: {
                blockId,
                type: 'image',
                attrs: { url, width, height }
              }
            })

            console.log('customBlockList', this.data.customBlockList)
          }
          break
        }
      }
    }
  }
})
