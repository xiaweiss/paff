import { emitter } from './utils/index'
import { getEditor } from './command/index'

const { shared, runOnJS } = wx.worklet

let time = 0

Component({
  options: {
    pureDataPattern: /^_/
  },
  data: {
    _isFocus: null,
    _scrollTop: null,
    isFocus: false,
    scrollTop: 0,
    keyboardHeight: 300,
    safeAreaBottom: 0,

    content: new Array(10).fill('哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈').join('\n\n'),
    composition: '',
    value: ' ',

    position: 0,
    start: 1,
    end: 1
  },
  lifetimes: {
    created () {
      this.scrollTo = this.scrollTo.bind(this)
      this.scrollStep = this.scrollStep.bind(this)
    },
    attached () {
      // 初始化编辑器
      getEditor(this)

      this.data._isFocus = shared(this.data.isFocus)
      this.data._scrollTop = shared(this.data.scrollTop)

      const windowInfo = wx.getWindowInfo()
      this.setData({safeAreaBottom: windowInfo.screenHeight - windowInfo.safeArea.bottom})

      // const deviceInfo = wx.getDeviceInfo()
      // this.setData({isPC: Boolean(['mac', 'windows', 'devtools'].includes(deviceInfo.platform))})

      this.keyboardHeightChange = this.keyboardHeightChange.bind(this)
      emitter.on('keyboardHeightChange', this.keyboardHeightChange)
    },
    detached () {
      emitter.off('keyboardHeightChange', this.keyboardHeightChange)
    }
  },
  observers: {
    isFocus (value) {
      this.data._isFocus.value = value
    }
  },
  methods: {
    noop () {},

    test () {
      this.data._isFocus.value = true
    },

    workletShouldResponseOnMoveVertical () {
      'worklet'
      return true
    },

    workletShouldAcceptGestureVertical () {
      'worklet'
      return true
    },

    workletOngestureVertical (e) {
      'worklet'

      console.log('gestureVertical', e.velocityY)

      // 聚焦时，使用手势带动 scroll-view 滚动，可以保持聚焦
      if (this.data._isFocus.value) {
        if (e.state === 3) {
          runOnJS(this.scrollStep)(e.velocityY)

        } else {
          this.data._scrollTop.value -= e.deltaY
          runOnJS(this.scrollTo)(this.data._scrollTop.value)
        }
      }
    },

    workletShouldResponseOnMoveScroll () {
      'worklet'
      return !this.data._isFocus.value
    },

    workletShouldAcceptGestureScroll () {
      'worklet'
      return !this.data._isFocus.value
    },

    workletOnscrollstart (e) {
      'worklet'
      // console.log('start', e.detail.scrollTop)
      this.data._scrollTop.value = e.detail.scrollTop
    },

    workletOnscrollupdate (e) {
      'worklet'
      // console.log('update', e.detail.scrollTop)
      this.data._scrollTop.value = e.detail.scrollTop
    },

    workletOnscrollend (e) {
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
    },

    keyboardHeightChange (res) {
      if (res.height > 0 && res.height !== this.data.keyboardHeight) {
        this.setData({keyboardHeight: res.height})
      }
    },

    tap () {
      this.setData({isFocus: true})
    },
    input (e) {
      console.log('input', JSON.stringify(e.detail))
      const { value } = e.detail
      const { content } = this.data

      // backspace
      if (value === '') {
        this.setData({
          content: content.slice(0, -1),
          start: 0,
          end: 0
        })

        this.setData({value: ' '}, () => {
          this.setData({
            start: 1, end: 1, isFocus: true
          })
        })

      // enter
      } else if (value === ' \n') {
        this.setData({
          content: content + value.slice(1),
          value: ' '
        })

      // other
      } else {
        this.setData({
          content: content + value.slice(1),
          value: ' '
        })
      }
    },
    change (e) {
      console.log('change', JSON.stringify(e.detail))
    },
    focus (e) {
      console.log('focus', JSON.stringify(e.detail))
      if (this.data.isFocus) return
      this.setData({isFocus: true})
    },
    blur (e) {
      console.log('blur', JSON.stringify(e.detail))
      if (!this.data.isFocus) return
      this.setData({isFocus: false})
    },
    confirm (e) {
      console.log('confirm', JSON.stringify(e.detail))
    },
    keyboardheightchange (e) {
      console.log('keyboardheightchange', JSON.stringify(e.detail))
    },
    selectionchange (e) {
      console.log('selectionchange', JSON.stringify(e))
    },
    keyboardcompositionstart (e) {
      console.log('keyboardcompositionstart', JSON.stringify(e))
      this.setData({composition: e.detail.data.slice(1)})
    },
    keyboardcompositionupdate (e) {
      console.log('keyboardcompositionupdate', JSON.stringify(e))
      this.setData({composition: e.detail.data.slice(1)})
    },
    keyboardcompositionend (e) {
      console.log('keyboardcompositionend', JSON.stringify(e))
      this.setData({composition: ''})
    },
    editorInput (e) {
      console.log('editorInput', JSON.stringify(e))

      this.setData({ value: e.detail.text })
    },
    statuschange (e) {
      console.log('statuschange', JSON.stringify(e))
    }
  }
})
