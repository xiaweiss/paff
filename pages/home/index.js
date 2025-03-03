Page({
  onShareAppMessage() {

  },

  data: {
    editor: null,
  },

  ready (e) {
    const { editor } = e.detail
    this.setData({ editor })
  }
})
