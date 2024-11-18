import { isAndroid } from '../../../utils/index'

// const fontFamily = "Menlo-Regular-2"
// const fontFamily = "MiSansLatin,'PingFang SC','Arial',system-ui"
// const fontFamily = "MiSansLatin,Arial,system-ui"
// iOS：Arial Menlo
// Android：sans-serif-condensed sans-serif-medium serif monospace

// Menlo, Monaco, 'Courier New', monospace
// -apple-system, BlinkMacSystemFont, 'Segoe WPC', 'Segoe UI', system-ui, 'Ubuntu', 'Droid Sans', sans-serif

Component({
  options: {
    pureDataPattern: /^_/,
    virtualHost: true,
  },
  data: {
    width: 0,
    height: 26,
    text: '哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈',
    // text: 'abcdefghijklmnopqrstuvwxyz1234567890',
    measureText: '',
    widthList: [],
    widthListCanvas: []
  },
  lifetimes: {
    async attached () {
      if (isAndroid()) {
        await new Promise((resolve) => {
          wx.loadFontFace({
            family: 'MiSansLatin',
            source: 'url("https://dev-pub-sdn-001.mowen.cn/fe/assets/font/MiSansLatin-Normal.woff")',
            scopes: ['webview', 'native'],
            success: (res) => {
              console.log('loadFontFace success', res)
              resolve()
            },
          })
        })
      }

      // 获取窗口尺寸信息
      const { windowWidth } = wx.getWindowInfo()
      this.setData({
        width: windowWidth,
      })
      this.createSelectorQuery()
        .select('#canvas')
        .fields({ node: true, size: true })
        .exec((res) => {
          const canvas = res[0].node

          const dpr = wx.getWindowInfo().pixelRatio
          canvas.width = res[0].width * dpr
          canvas.height = res[0].height * dpr


          const ctx = canvas.getContext('2d')
          ctx.scale(dpr, dpr)

          ctx.clearRect(0, 0, canvas.width, canvas.height)
          ctx.font = '16px ' + fontFamily
          ctx.fillText(this.data.text, 0, 19)
        })
    }
  },
  methods: {
    async textWidth () {
      const query = this.createSelectorQuery()
      const dom = query.select('.measure-text')

      let total = 0
      const widthList = []
      const { text } = this.data
      const list = [...text]
      for (const item of list) {
        this.setData({
          measureText: item
        })

        const width = await new Promise((resolve) => {
          dom.boundingClientRect(rect => {
            console.log('rect', rect)
            resolve(rect.width)
          }).exec()
        })
        widthList.push(+width.toFixed(2))
        total += +width.toFixed(2)
      }

      widthList.push(total)

      this.setData({
        widthList
      })
    },
    async textWidthCanvas () {
      const canvas = wx.createOffscreenCanvas({type: '2d', width: 50, height: 26})
      const ctx = canvas.getContext('2d')
      /* font-size/line height font-family */
      ctx.font = '16px ' + fontFamily

      let total = 0
      const widthListCanvas = []
      const { text } = this.data
      const list = [...text]

      for (const item of list) {
        ctx.clearRect(0, 0, canvas.width,canvas.height)
        ctx.fillText(item, 0, 19)
        const TextMetrics = ctx.measureText(item)
        console.log('TextMetrics', TextMetrics)

        const { width } = TextMetrics
        widthListCanvas.push(+width.toFixed(2))
        total += +width.toFixed(2)
      }

      widthListCanvas.push(total)

      this.setData({
        widthListCanvas
      })
    }
  },
})
