const app = getApp()

Component({
  options: {
    pureDataPattern: /^_/,
    virtualHost: true,
  },
  data: {
    ctx: null,
    doc: [{
      type: 'paragraph',
      content: [
        {
          type: 'text',
          text: '正正正正正正正正正正正正正正正正正正正正正正正正 This is a paragraph'
        },
        // {
        //   type: 'text',
        //   text: ' with a bold',
        //   marks: [{
        //     type: 'bold'
        //   }]
        // }
      ]
    }]
  },
  lifetimes: {
    // attached () {
    //   this.createCanvas()
    // },
    async ready() {
      await this.createCanvas()
      this.render()
    },
  },
  methods: {
    noop () {},
    async createCanvas () {
      const { pixelRatio: dpr } = app.globalData.systemInfo

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

      for (const node of doc) {
        if (node.type === 'paragraph') {
          this.renderParagraph(node)
        }
      }
    },

    /**
     * 绘制段落
     */
    renderParagraph (paragraph) {
      const { ctx } = this.data

      for (const node of paragraph.content) {
        if (node.type === 'text') {
          // line-height: 26;
          ctx.font = '16px system-ui';
          ctx.fillText(node.text, 0, 21); // 26 - (26 - 16) / 2 = 21
        }
      }
    }
  }
})
