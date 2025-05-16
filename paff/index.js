import { isAndroid, isIOS } from '../utils/index'
import { dataDoc } from './dataDoc'
import { isUnihan } from './utils/isUnihan'
import {
  clearContent,
  getEditor,
  getPadding,
  setContent
} from './command/index'

Component({
  options: {
    pureDataPattern: /^_/,
    virtualHost: true,
  },
  properties: {
    padding: { type: Array, value: [20, 28, 20, 28] }
  },
  data: {
    _measureTextNode: null,
    isAndroid: isAndroid(),
    isIOS: isIOS(),
    scrollTop: 0,
    node: {type: 'doc'},
    measureText: ''
  },
  lifetimes: {
    async attached () {
      // 初始化数据
      getEditor(this)
      getPadding(this.properties.padding)

      // 设置笔记内容
      await setContent(dataDoc)
    }
  },
  methods: {
    noop () {},
    async test (e) {
      const dataDoc = {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: '11111'
              }
            ]
          }
        ]
      }
      await setContent(dataDoc)

      // this.focus()
      // this.setData({ scrollTop: 10000 })
    },
    focus () {
      this.selectComponent('#keyboard').focus()
    },
    blur () {
      this.selectComponent('#keyboard').blur()
    },
    command (e) {
      console.log('command', e)
      // todo: 实现一个管理器，可以 chain 调用
      const { command, value } = e.detail
      switch (command) {
        case 'test': { this.test(e); break }
        case 'blur': { this.blur(); break }
        case 'poster': { this.poster(); break }
        case 'clearContent': { clearContent(this); break }
      }
    },
    async measureText (text) {
      const { _measureTextNode } = this.data
      if (!_measureTextNode) {
        this.data._measureTextNode = this.createSelectorQuery().select('.measure-text').boundingClientRect()
      }

      if (isUnihan(text)) return 16

      // todo: 处理下emoji，参考下 unicode 字符列表 https://en.wikipedia.org/wiki/List_of_Unicode_characters
      // todo: 处理标点符号

      return await new Promise((resolve) => {
        this.setData({ measureText: text }, () => {
          this.data._measureTextNode.exec((res) => {
            console.log('measureText', text, res[0].width)
            resolve(res[0].width)
          })
        })
      })
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
