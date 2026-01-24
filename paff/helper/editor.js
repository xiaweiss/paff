/** 编辑器实例（props 传给子组件无法调用） */
export let editor = null

export const registerEditor = (value) => {
  editor = value
}

export const unReigsterEditor = () => {
  editor = null
}
