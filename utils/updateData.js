/**
 * 更新数据
 * @param _this 当前页面实例
 * @param path 更新路径
 * @param item 要更新的数据项
 *
 * webview 通过 setData 只更新追加的数据，而不是更新整个数组，以获得更好的性能
 * @see: https://developers.weixin.qq.com/miniprogram/dev/framework/performance/tips/runtime_setData.html
 *
 * skyline 使用高级数据更新方法，以获得更好的性能
 * @see: https://github.com/wechat-miniprogram/glass-easel/blob/master/glass-easel/guide/zh_CN/data_management/advanced_update.md
 */
export const updateData = (_this, path, item) => {
  if (
    _this.renderer === 'skyline' &&
    typeof _this.replaceDataOnPath === 'function' &&
    typeof _this.applyDataUpdates === 'function'
  ) {
    _this.replaceDataOnPath(path, item)
    _this.applyDataUpdates()
  } else {
    const _path = path.map(item => typeof item === 'number' ? `[${item}]` : item).join('.').replace(/\.\[/g, '[')
    const data = {}

    data[_path] = item
    _this.setData(data)
  }
}

// const path = ['typeList', 0, 'list', 0, 'name']
// const _path = path.map(item => typeof item === 'number' ? `[${item}]` : item).join('.').replace(/\.\[/g, '[')
// _path

// updateListItem(this, ['list', 0], {id: '1', name: 'a'})

