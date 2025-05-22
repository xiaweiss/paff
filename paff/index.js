const app = getApp()

Component({
  data: {
    content: '',
    composition: '',
    value: ' ',
    type: 'textarea',
    isFocus: false,
    position: 0,
    start: 1,
    end: 1
  },
  methods: {
    test (e) {
      const { item }  = e.currentTarget.dataset
      console.log('item', item)
      this.setData({start: item, end: item, isFocus: true})
    },
    input (e) {
      console.log('input', JSON.stringify(e.detail))
      const { value } = e.detail
      const { content } = this.data

      // backspace
      if (value === '') {
        this.setData({
          content: content.slice(0, -1),
          start: 0,
          end: 0
        })

        this.setData({value: ' '}, () => {
          this.setData({
            start: 1, end: 1, isFocus: true
          })
        })

      // enter
      } else if (value === ' \n') {
        this.setData({
          content: content + value.slice(1),
          value: ' '
        })

      // other
      } else {
        this.setData({
          content: content + value.slice(1),
          value: ' '
        })
      }
    },
    change (e) {
      console.log('change', JSON.stringify(e.detail))
    },
    focus (e) {
      console.log('focus', JSON.stringify(e.detail))
    },
    blur (e) {
      console.log('blur', JSON.stringify(e.detail))
    },
    confirm (e) {
      console.log('confirm', JSON.stringify(e.detail))
    },
    keyboardheightchange (e) {
      console.log('keyboardheightchange', JSON.stringify(e.detail))
    },
    selectionchange (e) {
      console.log('selectionchange', JSON.stringify(e))
    },
    keyboardcompositionstart (e) {
      console.log('keyboardcompositionstart', JSON.stringify(e))
      this.setData({composition: e.detail.data.slice(1)})
    },
    keyboardcompositionupdate (e) {
      console.log('keyboardcompositionupdate', JSON.stringify(e))
      this.setData({composition: e.detail.data.slice(1)})
    },
    keyboardcompositionend (e) {
      console.log('keyboardcompositionend', JSON.stringify(e))
      this.setData({composition: ''})
    },
    editorInput (e) {
      console.log('editorInput', JSON.stringify(e))

      this.setData({ value: e.detail.text })
    },
    statuschange (e) {
      console.log('statuschange', JSON.stringify(e))
    }
  }
})
