Component({
  properties: {
    /** 图片资源地址 */
    src: { type: String, value: '' },
    /** 图片裁剪、缩放的模式 */
    mode: { type: String, value: 'aspectFill' },
    /** 长按图片显示菜单 */
    showMenuByLongpress: { type: Boolean, value: false },
    /** skyline 是否渐显 */
    fadeIn: { type: Boolean, value: false },

    // 自定义特性
    srcSmall: { type: String, value: '' },
    width: { type: Number, value: 0 },
    height: { type: Number, value: 0 },
    maxWidth: { type: Number, value: 0 },

    del: Boolean,
    // 上传进度：0 正在上传、100 处理中，小于 0 上传失败，大于 100 上传成功
    progress: { type: Number, value: 200 },
    risky: Boolean,
  },
  externalClasses: ['class', 'placeholder-class'],
  data: {
    theme: 'white',
    isSmallLoaded: false,
    isLoaded: false,
  },
  methods: {
    noop () {},
    preview () {
      this.triggerEvent('preview')
    },
    loadSmall () {
      this.setData({ isSmallLoaded: true })
    },
    errorSmall () {
      this.setData({ isSmallLoaded: false })
    },
    load () {
      this.setData({ isLoaded: true })
    },
    error () {
      this.setData({ isLoaded: false })
    },
    retry () {
      this.triggerEvent('retry')
    },
    del () {
      this.triggerEvent('del')
    },
  }
})
