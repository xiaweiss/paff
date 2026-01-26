/**
 * 按需更新列表
 * @param _this 当前页面实例
 * @param path 更新路径
 * @param appendData 追加数据
 * @param concat 是否追加，不追加则重新设置整个数组
 * @param arrayUniqId 数组去重 id，只对 appendData 去重
 *
 * webview 通过 setData 只更新追加的数据，而不是更新整个数组，以获得更好的性能
 * @see: https://developers.weixin.qq.com/miniprogram/dev/framework/performance/tips/runtime_setData.html
 *
 * skyline 使用高级数据更新方法，以获得更好的性能
 * @see: https://github.com/wechat-miniprogram/glass-easel/blob/master/glass-easel/guide/zh_CN/data_management/advanced_update.md
 */
export const updateList = (_this, path, appendData, concat, arrayUniqId) => {
  let source = _this.data
  if (concat) {
    for (const item of path) source = source[item]
  } else {
    source = []
  }

  let append = []
  // 数组去重
  if (arrayUniqId) {
    const temp = {}
    const idArray = arrayUniqId.split('.')

    // 源数组只记录唯一的 id
    for (const item of source) {
      let id = item
      for (const key of idArray) {
        id = id[key]
      }
      if (
        (typeof id === 'string' || typeof id === 'number') &&
        !temp[id]
      ) {
        temp[id] = true
      }
    }

    // 追加数组去重
    for (const item of appendData) {
      let id = item
      for (const key of idArray) {
        id = id[key]
      }
      if (
        (typeof id === 'string' || typeof id === 'number') &&
        !temp[id]
      ) {
        temp[id] = true
        append.push(item)
      }
    }
  } else {
    append = appendData
  }

  if (
    _this.renderer === 'skyline' &&
    typeof _this.spliceArrayDataOnPath === 'function' &&
    typeof _this.replaceDataOnPath === 'function' &&
    typeof _this.applyDataUpdates === 'function'
  ) {
    if (concat) {
      _this.spliceArrayDataOnPath(path, source.length, 0, append)
    } else {
      _this.replaceDataOnPath(path, append)
    }

    _this.applyDataUpdates()

  } else {
    const _path = path.map(item => typeof item === 'number' ? `[${item}]` : item).join('.').replace(/\.\[/g, '[')
    const data = {}

    if (concat) {
      for (let i = 0; i < append.length; i++) {
        data[`${_path}[${source.length + i}]`] = append[i]
      }
    } else {
      data[_path] = append
    }

    _this.setData(data)
  }

  return [...source, ...append]
}

// const source = [{id: '1', name: 'a'}, {id: '2', name: 'b'}, {id: '3', name: 'c'}]
// const append = [{id: '3', name: 'c'}, {id: '4', name: 'd'}]
// console.log(updateList(null, source, append, 'id'))

// const source = [{base: {id: '1', name: 'a'}}, {base: {id: '2', name: 'b'}}, {base: {id: '3', name: 'a'}}]
// const append = [{base: {id: '3', name: 'c'}}, {base: {id: '4', name: 'd'}}]
// console.log(updateList(null, source, append, 'base.id'))

// const path = ['typeList', 0, 'list', 0, 'name']
// const _path = path.map(item => typeof item === 'number' ? `[${item}]` : item).join('.').replace(/\.\[/g, '[')
// _path

// updateList({renderer: 'skyline'}, ['typeList', 0, 'list'], ['a', 'b', 'c'], ['d', 'e', 'f'])

