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
      this.triggerEvent('bold')
    },
    save () {
      this.triggerEvent('save')
    }
  },
});
