// todo: 需要考虑多个页面实例的情况

let $editor = null

export const getEditor = (editor) => {
  if (editor) $editor = editor
  return $editor
}
