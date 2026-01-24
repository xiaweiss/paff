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
    save () {
      this.triggerEvent('save')
    }
  },
});
