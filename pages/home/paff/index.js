import { doc } from './doc'
import { touchstart, touchmove, touchend } from './touch'

const app = getApp()

let rx = 0
let ry = 0
let scrolling = false
let scrollTop = 0
let scrollHeight = 0
let requestId = 0

Component({
  options: {
    pureDataPattern: /^_/,
    virtualHost: true,
  },
  data: {
    _windowInfo: {},
    width: 0,
    height: 0,
    canvas: null,
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
    touchstart (e) {
      const { height } = this.data
      touchstart({e, scrollTop, scrollHeight, height})
    },
    touchmove (e) {
      const { canvas, ctx, width, height } = this.data
      const res = touchmove({e})

      switch (res.type) {
        case 'scroll':
          scrolling = true
          scrollTop = res.scrollTop

          canvas.cancelAnimationFrame(requestId)
          requestId = canvas.requestAnimationFrame(() => {
            ry = -scrollTop
            this.clear()
            this.render()
          })
          break
      }
    },
    touchend (e) {
      const { canvas, ctx, width, height } = this.data
      const res = touchend({e, scrollTop, scrollHeight, height})

      console.log('touchend 2')

      this.scrollTo(res.scrollTop, 300)
    },
    scrollTo (targetY, duration) {
      const startTime = Date.now()
      const startScrollTop = scrollTop
      let msPassed = 0
      let oldTimeStamp = 0
      let movingSpeed = (targetY - scrollTop) / duration

      console.log('movingSpeed', movingSpeed)
      console.log('scrollTop', scrollTop)

      const { canvas } = this.data
      const step = (timeStamp) => {
        // 计算过去的时间
        // if (oldTimeStamp) {
        //   msPassed = (timeStamp - oldTimeStamp)
        // }
        // 使用时间计算新位置
        // scrollTop += Math.round(movingSpeed * msPassed)

        msPassed = Date.now() - startTime
        scrollTop = startScrollTop + easeOutCubic(msPassed / duration) * (targetY - startScrollTop)

        // 向上滚动
        if (movingSpeed >=0) {
          if (scrollTop > targetY) scrollTop = targetY

        // 向下滚动
        } else {
          if (scrollTop < targetY) scrollTop = targetY
        }

        ry = -scrollTop

        this.clear()
        this.render()


        if (scrollTop === targetY) {
          console.log('scrollTo done', Date.now() - startTime)
          return
        }

        oldTimeStamp = timeStamp
        canvas.requestAnimationFrame(step)
      }

      canvas.requestAnimationFrame(step)
    },
    onTap (e) {
      return

      const { canvas, ctx, width, height } = this.data
      let y = 0
      const scroll = () => {
        scrolling = true
        y -= 2
        rx = 0
        ry = y

        ctx.clearRect(0, 0, width, height)
        this.render()
        canvas.requestAnimationFrame(scroll)
      }

      canvas.requestAnimationFrame(scroll)
    },
    async createCanvas () {
      // todo: 避让底部安全区、工具栏位置
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

            this.data.width = res[0].width
            this.data.height = res[0].height
            this.data.canvas = canvas
            this.data.ctx = ctx
            resolve()
          })
      })
    },
    /**
     * 清空画布
     */
    clear () {
      const { ctx, width, height } = this.data
      ctx.clearRect(0, 0, width, height)
    },
    /**
     * 全量绘制
     */
    render () {
      const { ctx, doc } = this.data

      const ryStart = ry

      for (const node of doc) {
        if (node.type === 'paragraph') {
          this.renderParagraph(node)
        }
      }

      scrollHeight = ry - ryStart + 5 // 文字底部距离 （26 - 16） / 2
    },

    /**
     * 绘制段落
     */
    renderParagraph (paragraph) {
      const { ctx, height } = this.data
      const { windowWidth } = this.data._windowInfo

      for (const node of paragraph.content) {
        if (node.type === 'text') {
          // line-height: 26;
          ctx.font = '16px system-ui';

          // 计算文字宽度 // todo: 处理双字符文字，例如 emoji
          if (!scrolling) {
            node.textArray = node.text.split('')
            node.textWidth = node.textArray.map(str => {
              // 双字节字符，宽度为 16
              if (/[^\x00-\xff]/.test(str)) {
                return 16
              // 其它字符，获取宽度
              } else {
                return ctx.measureText(str).width
              }
            })
            node.total = node.textArray.length
          }

          // 绘制文字 // todo: 获取段落开始的 y 坐标
          for (let i = 0; i < node.total; i += 1) {
            if (rx + node.textWidth[i] > windowWidth) {
              rx = 0
              ry += 26
            }

            // 在画布区域内时，才绘制
            if (ry + 26 > 0 && ry < height) {
              // console.log('fillText', node.textArray[i], rx, ry + 21); // 26 - (26 - 16) / 2 = 21
              ctx.fillText(node.textArray[i], rx, ry + 21); // 26 - (26 - 16) / 2 = 21
            }

            rx += node.textWidth[i]
          }
        }
      }

      rx = 0
      ry += 26
    }
  }
})

/**
 * 缓动函数
 * @see https://easings.net/#easeOutCubic
 */
function easeOutCubic(x) {
  return 1 - Math.pow(1 - x, 3);
}
