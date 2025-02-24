import { isAndroid, isIOS, isPC } from '../utils/index'
import { dataDoc } from './dataDoc'

Component({
  options: {
    pureDataPattern: /^_/,
    virtualHost: true,
  },
  data: {
    isAndroid: isAndroid(),
    isIOS: isIOS(),
    scrollTop: 0,
    node: dataDoc
  },
  methods: {
    noop () {},
    async test () {
      console.log('test')
      this.focus()
      // this.setData({ scrollTop: 10000 })
    },
    focus () {
      this.selectComponent('#keyboard').focus()
    },
    blur () {
      this.selectComponent('#keyboard').blur()
    },
    async poster () {
      const { systemInfo } = getApp().globalData
      const dpr = systemInfo.pixelRatio

      let { width, height } = await new Promise(resolve => {
        this.createSelectorQuery().select('.paff-container').boundingClientRect((res) => {
          resolve(res)
        }).exec()
      })

      width *= dpr
      height *= dpr

      const type = '2d'
      const canvas = wx.createOffscreenCanvas({type, width, height})
      const context = canvas.getContext(type)

      // 缩放画布上下文以适应 dpr
      context.scale(dpr, dpr)

      // 绘制背景色（真机上可能不需要）
      context.fillStyle = '#fff'
      context.fillRect(0, 0, width, height)

      // 绘制文本
      context.fillStyle = '#333'
      context.font = '16px system-ui'
      context.textBaseline = 'top'
      // line-height: 26;

      let ry = 0

      // TODO: 这里按现有数据结构简单渲染一下，实际复杂场景中需要进一步适配，并将渲染逻辑放到自定义组件中
      for (const node1 of this.data.node.content) {
        // 图片
        if (node1.type === 'image') {
          const image = canvas.createImage()
          await new Promise(resolve => {
            image.onload = resolve
            image.src = node1.attrs.url
          })

          context.drawImage(
            image,
            0, ry, node1.attrs.width, node1.attrs.height
          )
          ry += node1.attrs.height

        // 段落
        } else if (node1.type === 'paragraph') {
          context.fillText(node1.type, 0, ry + 5) // (26 - 16) / 2
          ry += 26

          if (node1.content) {
            for (const node2 of node1.content) {
              context.fillText(node2.type, 10, ry + 5) // (26 - 16) / 2
              ry += 26
            }
          }
        }
      }

      // PC 端：生成图片（canvasToTempFilePath 无效，需要 canvas.toDataURL 来兼容下）
      // 移动端：生成图片
      wx.canvasToTempFilePath({
        x: 0,
        y: 0,
        width,
        height,
        canvas,
        fileType: 'png',
        success (res) {
          console.log('success', res.tempFilePath)
          wx.previewImage({
            current: res.tempFilePath,
            urls: [res.tempFilePath]
          })
          wx.getImageInfo({
            src: res.tempFilePath,
            success (res) {
              console.log('getImageInfo', res)
            },
          })
        }
      })
    }
  }
})
