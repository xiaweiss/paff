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
    bold () {
      editor.command.bold()
    },
    image () {
      editor.command.insertImage()
    },
    save () {
      this.triggerEvent('save')
    }
  },
});
