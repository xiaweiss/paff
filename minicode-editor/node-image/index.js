Component({
  options: {
    virtualHost: true
  },
  properties: {
    node: Object,
    windowWidth: Number
  },
  methods: {
    command (e) {
      const { command } = e.currentTarget.dataset
      const { node } = this.properties
      this.triggerEvent('command', {command, node})
    }
  }
})
