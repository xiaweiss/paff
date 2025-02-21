import { isAndroid, isIOS } from '../utils/index'
import { dataDoc } from './dataDoc'

const app = getApp()

Component({
  options: {
    pureDataPattern: /^_/,
    virtualHost: true,
  },
  data: {
    isAndroid: isAndroid(),
    isIOS: isIOS(),
    scrollTop: 0,
    node: dataDoc
  },
  methods: {
    noop () {},
    async test () {
      console.log('test')
      this.focus()
      // this.setData({ scrollTop: 10000 })
    },
    focus () {
      this.selectComponent('#keyboard').focus()
    },
    blur () {
      this.selectComponent('#keyboard').blur()
    }
  }
})
