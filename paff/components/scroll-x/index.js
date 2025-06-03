const { shared, runOnJS } = wx.worklet

let time = 0

Component({
  options: {
    pureDataPattern: /^_/,
    virtualHost: true
  },
  properties: {
    isFocus: Boolean
  },
  data: {
    _isFocus: null,
    _scrollLeft: null,
    scrollLeft: 0,
  },
  observers: {
    isFocus (value) {
      if (this.data._isFocus) {
        this.data._isFocus.value = value
      }
    }
  },
  lifetimes: {
    created () {
      this.scrollTo = this.scrollTo.bind(this)
      this.scrollStep = this.scrollStep.bind(this)
    },
    attached () {
      this.data._isFocus = shared(this.properties.isFocus)
      this.data._scrollLeft = shared(this.data.scrollLeft)
    }
  },
  methods: {
    horizontal_should_response_on_move () {
      'worklet'
      return true
    },

    horizontal_should_accept_gesture () {
      'worklet'
      return true
    },

    horizontal_on_gesture (e) {
      'worklet'

      // 聚焦时，使用手势带动 scroll-view 滚动，可以保持聚焦
      if (this.data._isFocus.value) {
        // 手势终止
        if (e.state === 3) {
          runOnJS(this.scrollStep)(e.velocityX)

        } else {
          this.data._scrollLeft.value -= e.deltaX
          runOnJS(this.scrollTo)(this.data._scrollLeft.value)
        }
      }
    },

    scroll_should_response_on_move () {
      'worklet'
      return !this.data._isFocus.value
    },

    scroll_should_accept_gesture () {
      'worklet'
      return !this.data._isFocus.value
    },

    on_scroll_start (e) {
      'worklet'
      this.data._scrollLeft.value = e.detail.scrollLeft
    },

    on_scroll_update (e) {
      'worklet'
      this.data._scrollLeft.value = e.detail.scrollLeft
    },

    on_scroll_end (e) {
      'worklet'
      this.data._scrollLeft.value = e.detail.scrollLeft
    },

    scrollTo (value) {
      const now = Date.now()
      if (now - time < 16) return
      time = now

      if (value > 0) {
        this.setData({scrollLeft: value})
      }
    },

    scrollStep (speed) {
      speed = Math.min(Math.max(speed, -3000), 3000)
      const start = this.data._scrollLeft.value
      const startTime = Date.now()
      const duration = 300
      const end = Math.round(start - speed / 1000 * 300)

      /**
       * 缓动函数
       * @see https://easings.net/#easeOutCubic
       */
      function easeOutCubic(x) {
        return 1 - Math.pow(1 - x, 3);
      }

      const step = () => {
        // 计算过去的时间
        const msPassed = Date.now() - startTime

        // 使用进度计算新位置
        const scrollLeft = Math.round(start + easeOutCubic(msPassed / duration) * (end - start))

        this.setData({scrollLeft})

        if (scrollLeft === end) return

        setTimeout(step, 16)
      }

      setTimeout(step, 16)
    }
  }
})
