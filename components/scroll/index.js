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
    _scrollTop: null,
    scrollTop: 0,
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
      this.data._scrollTop = shared(this.data.scrollTop)
    },
    detached () {

    },
  },
  methods: {
    vertical_should_response_on_move () {
      'worklet'
      return true
    },

    vertical_should_accept_gesture () {
      'worklet'
      return true
    },

    vertical_on_gesture (e) {
      'worklet'

      // 聚焦时，使用手势带动 scroll-view 滚动，可以保持聚焦
      if (this.data._isFocus.value) {
        // 手势终止
        if (e.state === 3) {
          runOnJS(this.scrollStep)(e.velocityY)

        } else {
          this.data._scrollTop.value -= e.deltaY
          runOnJS(this.scrollTo)(this.data._scrollTop.value)
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
      this.data._scrollTop.value = e.detail.scrollTop
    },

    on_scroll_update (e) {
      'worklet'
      this.data._scrollTop.value = e.detail.scrollTop
    },

    on_scroll_end (e) {
      'worklet'
      this.data._scrollTop.value = e.detail.scrollTop
    },

    scrollTo (value) {
      const now = Date.now()
      if (now - time < 16) return
      time = now

      if (value > 0) {
        this.setData({scrollTop: value})
      }
    },

    scrollStep (speed) {
      speed = Math.min(Math.max(speed, -3000), 3000)
      const start = this.data._scrollTop.value
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
        const scrollTop = Math.round(start + easeOutCubic(msPassed / duration) * (end - start))

        this.setData({scrollTop})

        if (scrollTop === end) return

        setTimeout(step, 16)
      }

      setTimeout(step, 16)
    }
  }
})
