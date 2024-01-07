export {}

const app = getApp<AppData>()

Component({
  options: {
    pureDataPattern: /^_/,
    virtualHost: true,
  },
  data: {
    ctx: null as null | WechatMiniprogram.RenderingContext,
  },
  lifetimes: {
    attached () {
      console.log('attached')
      this.createCanvas()
    },
    async ready() {
      await this.createCanvas()
    },
  },
  methods: {
    noop () {},
    async createCanvas () {
      const { pixelRatio: dpr } = app.globalData.systemInfo!

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
      await new Promise<void>((resolve) => {
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
    }
  }
})
