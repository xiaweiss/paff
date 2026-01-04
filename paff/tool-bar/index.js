Component({
  properties: {

  },
  data: {

  },
  lifetimes: {
    created() {

    },
    attached() {

    },
    moved() {

    },
    detached() {

    },
  },
  methods: {
    noop () {},
    func () {
      wx.showToast({
        title: 'function'
      })
    }
  },
});
