import { wxToPromise } from '../../utils/index'
import { editor } from '../helper/index'

Component({
  properties: {
    formats: Object
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
    async chooseImage () {
      const [res] = await wxToPromise(wx.chooseMedia, {
        count: 1,
        mediaType: ['image'],
        // sizeType: ['original'],
        sourceType: ['album'],
      })

      if (res) {
        const tempFilePath = res.tempFiles.map(item => item.tempFilePath)[0]

        editor.command.insertImage({
          src: tempFilePath
        })
      }
    },
    bold () {
      editor.command.bold()
    },
    save () {
      this.triggerEvent('save')
    }
  },
});
