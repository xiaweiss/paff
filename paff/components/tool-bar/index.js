Component({
  options: {
    virtualHost: true,
  },
  properties: {
    isFocus: Boolean,
    keyboardHeight: 300,
    safeAreaBottom: 0,
  },
  data: {

  },
  lifetimes: {

  },
  methods: {
    noop () {},
    onKeyboardHeightChange (res) {
      if (res.height > 0 && res.height !== this.data.keyboardHeight) {
        this.setData({
          keyboardHeight: res.height,
        })
      }
    },
    command (e) {
      const { command } = e.currentTarget.dataset
      this.triggerEvent('command', { command })
    }
  }
})
