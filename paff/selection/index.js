Component({
  options: {
    virtualHost: true
  },
  properties: {
    padding: { type: Array }
  },
  data: {
    empty: true,
    start: 0,
    end: 0,
    position: [[0,0,2,18]],
  },
  lifetimes: {
    attached () {
      this.setPosition()
    }
  },
  methods: {
    setPosition () {
      const { padding } = this.properties
      const paddingLeft = padding[3]
      const paddingTop = padding[0]

      this.setData({
        position: [[paddingLeft, paddingTop, 2, 18]],
      })

      // this.setData({
      //   empty: false,
      //   position: [
      //     [paddingLeft, paddingTop, 64, 25.6],
      //     [paddingLeft, paddingTop + 25.6, 319, 25.6],
      //     [paddingLeft, paddingTop + 51.2, 256, 25.6],
      //   ],
      // })
    }
  }
})
