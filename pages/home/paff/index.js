import { doc } from './doc'

const app = getApp()

let rx = 0
let ry = 0

Component({
  options: {
    pureDataPattern: /^_/,
    virtualHost: true,
  },
  data: {
    _windowInfo: {},
    ctx: null,
    doc
  },
  lifetimes: {
    attached () {
      this.data._windowInfo = wx.getWindowInfo()
    },
    async ready() {
      await this.createCanvas()
      this.render()
    },
  },
  methods: {
    noop () {},
    onTap (e) {
      // const x = Math.round(e.detail.x)
      // const y = Math.round(e.detail.y)

      // wx.showToast({
      //   icon: 'none',
      //   title: `tap: x=${x}, y=${y}`,
      // })
    },
    async createCanvas () {
      const { pixelRatio: dpr } = this.data._windowInfo

      /**
       * canvas 画布尺寸（逻辑尺寸不能大于画布尺寸 * dpr）
       * ios           1365x1365
       * ipad mini 6   2046x2046
       * mac           8190x8190
       * android       5828x5828（最大渲染尺寸，但小程序会 crash）
       *
       * 安卓尺寸限制在 ios 范围内
       */

      // 创建 2D canvas 实例（画布尺寸越大，越消耗性能）
      await new Promise((resolve) => {
        this.createSelectorQuery()
          .select('#canvas')
          .fields({
            node: true,
            size: true,
          })
          .exec((res) => {
            const canvas = res[0].node

            canvas.width = res[0].width * dpr
            canvas.height = res[0].height * dpr

            const ctx = canvas.getContext('2d')
            ctx.scale(dpr, dpr)

            this.data.ctx = ctx
            resolve()
          })
      })
    },
    /**
     * 全量绘制
     */
    render () {
      const { ctx, doc } = this.data

      const start = Date.now()

      for (const node of doc) {
        if (node.type === 'paragraph') {
          this.renderParagraph(node)
        }
      }

      console.log('render time', Date.now() - start)
    },

    /**
     * 绘制段落
     */
    renderParagraph (paragraph) {
      const { ctx } = this.data
      const { windowWidth } = this.data._windowInfo

      for (const node of paragraph.content) {
        if (node.type === 'text') {
          // line-height: 26;
          ctx.font = '16px system-ui';

          // 计算文字宽度 // todo: 处理双字符文字，例如 emoji
          node.textArray = node.text.split('')
          node.textWidth = node.textArray.map(str => ctx.measureText(str).width)
          node.total = node.textArray.length

          // 绘制文字 // todo: 获取段落开始的 y 坐标
          for (let i = 0; i < node.total; i += 1) {
            if (rx + node.textWidth[i] > windowWidth) {
              rx = 0
              ry += 26
            }

            // console.log('fillText', node.textArray[i], rx, ry + 21); // 26 - (26 - 16) / 2 = 21
            ctx.fillText(node.textArray[i], rx, ry + 21); // 26 - (26 - 16) / 2 = 21

            rx += node.textWidth[i]
          }
        }
      }

      rx = 0
      ry += 26
    }
  }
})
